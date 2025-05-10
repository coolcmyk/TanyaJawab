const db = require('../config/databaseConfig');

exports.addCourse = async (req, res) => {
  try {
    const { name, day_of_week, start_time, end_time } = req.body;
    const userId = req.user.id;

    if (!name || day_of_week === undefined || !start_time || !end_time) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const result = await db.query(
      `INSERT INTO courses (user_id, name, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, name, day_of_week, start_time, end_time]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil user ID dari middleware auth
    const result = await db.query(
      `SELECT * FROM courses WHERE user_id = $1 ORDER BY day_of_week, start_time ASC`,
      [userId]
    );

    console.log("Courses fetched:", result.rows); // Debugging
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID course dari parameter URL
    const { name, day_of_week, start_time, end_time } = req.body;
    const userId = req.user.id; // Ambil user ID dari middleware auth

    if (!name || day_of_week === undefined || !start_time || !end_time) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const result = await db.query(
      `UPDATE courses 
       SET name = $1, day_of_week = $2, start_time = $3, end_time = $4
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [name, day_of_week, start_time, end_time, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Jadwal kuliah tidak ditemukan" });
    }

    console.log("Course updated:", result.rows[0]); // Debugging
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};