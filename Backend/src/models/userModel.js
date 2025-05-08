const db = require('../config/databaseConfig');
const bcrypt = require('bcrypt');

class User {
  static async findByEmail(email) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  }

  static async create(userData) {
    const { name, email, password } = userData;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const { rows } = await db.query(
      'INSERT INTO users (id, name, email, password) VALUES (uuid_generate_v4(), $1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    
    return rows[0];
  }

  static async createWithGithub(userData) {
    const { name, email, github_id } = userData;
    
    const { rows } = await db.query(
      'INSERT INTO users (id, name, email, github_id) VALUES (uuid_generate_v4(), $1, $2, $3) RETURNING id, name, email, github_id',
      [name, email, github_id]
    );
    
    return rows[0];
  }

  static async findByGithubId(githubId) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE github_id = $1',
      [githubId]
    );
    return rows[0];
  }
}

module.exports = User;