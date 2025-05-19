const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const databaseConfig = require('./src/config/databaseConfig'); 

// This should be at the top, before any code that uses the environment variables
dotenv.config();
console.log("GitHub Client ID:", process.env.GITHUB_CLIENT_ID); // Add this to verify it's loaded

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/documents', require('./src/routes/documentsRoutes'));
app.use('/courses', require('./src/routes/coursesRoutes'));
app.use('/assignments', require('./src/routes/assignmentsRoutes'));
app.use('/dashboard', require('./src/routes/dashboardRoutes'));

databaseConfig.getConnection()


app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON:', err.message);
    return res.status(400).json({ message: 'Invalid JSON format' });
  }
  next();
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add error handlers for the server
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Add graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Prevent immediate exit for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process - just log the error
});