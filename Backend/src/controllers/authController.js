const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const db = require('../config/databaseConfig');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    user = await User.create({
      name,
      email,
      password
    });
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send the password
    delete user.password;
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.githubAuth = (req, res) => {
  try {
    // Get the callback URL from environment variables
    const callbackUrl = process.env.GITHUB_CALLBACK_URL || process.env.GITHUB_REDIRECT_URI;
    
    if (!callbackUrl) {
      console.error("GitHub callback URL is not defined in environment variables");
      return res.status(500).send("Server configuration error: GitHub callback URL is not defined");
    }
    
    if (!process.env.GITHUB_CLIENT_ID) {
      console.error("GitHub client ID is not defined in environment variables");
      return res.status(500).send("Server configuration error: GitHub client ID is not defined");
    }
    
    // Properly encode the URL
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    
    console.log("Using GitHub callback URL:", callbackUrl);
    
    // Build the GitHub authorization URL
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodedCallbackUrl}&scope=user:email`;
    
    console.log("Redirecting to GitHub authorization URL:", githubUrl);
    res.redirect(githubUrl);
  } catch (error) {
    console.error("Error in githubAuth:", error);
    res.status(500).send("Internal server error during GitHub authentication");
  }
};



exports.githubCallback = async (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    return res.status(400).json({ message: 'GitHub code not provided' });
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });
    
    // Get user email from GitHub
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });
    
    const primaryEmail = emailResponse.data.find(email => email.primary)?.email || emailResponse.data[0]?.email;
    
    if (!primaryEmail) {
      return res.status(400).json({ message: 'Could not retrieve email from GitHub' });
    }
    
    const githubUser = userResponse.data;
    
    // Implement retry logic for database operations
    let retries = 3;
    let user = null;
    
    while (retries > 0) {
      try {
        // Check if user already exists
        user = await User.findByGithubId(githubUser.id);
        break; // Break the loop if successful
      } catch (dbError) {
        console.log(`Database retry attempt ${4-retries}. Error: ${dbError.message}`);
        retries--;
        if (retries === 0) {
          throw dbError; // Rethrow the error if all retries fail
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Reset retries for next database operation
    retries = 3;
    
    if (!user) {
      while (retries > 0) {
        try {
          // Check if email exists
          user = await User.findByEmail(primaryEmail);
          
          if (user) {
            // Update existing user with GitHub ID
            await db.query(
              'UPDATE users SET github_id = $1 WHERE id = $2',
              [githubUser.id, user.id]
            );
          } else {
            // Create new user
            user = await User.createWithGithub({
              name: githubUser.name || githubUser.login,
              email: primaryEmail,
              github_id: githubUser.id
            });
          }
          break; // Break the loop if successful
        } catch (dbError) {
          console.log(`Database retry attempt ${4-retries}. Error: ${dbError.message}`);
          retries--;
          if (retries === 0) {
            throw dbError; // Rethrow the error if all retries fail
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error.message);
    
    // Provide a more user-friendly error page instead of just a JSON response
    if (error.message && error.message.includes('Connection terminated')) {
      return res.status(503).send(`
        <html>
          <head><title>Database Connection Error</title></head>
          <body>
            <h1>Temporary Service Unavailable</h1>
            <p>We're having trouble connecting to our database. Please try again in a few minutes.</p>
            <a href="${process.env.FRONTEND_URL}">Return to home page</a>
          </body>
        </html>
      `);
    }
    
    res.status(500).send(`
      <html>
        <head><title>Authentication Error</title></head>
        <body>
          <h1>Authentication Failed</h1>
          <p>We couldn't complete your GitHub authentication. Please try again.</p>
          <a href="${process.env.FRONTEND_URL}">Return to home page</a>
        </body>
      </html>
    `);
  }
};