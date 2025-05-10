const db = require('../config/databaseConfig');

exports.getAssignments = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil user ID dari middleware auth
    const result = await db.query(
      `SELECT a.*, c.name as course_name
       FROM assignments a
       LEFT JOIN courses c ON a.course_id = c.id
       WHERE a.user_id = $1
       ORDER BY a.due_date ASC`,
      [userId]
    );

    const assignments = result.rows.map(row => ({
      ...row,
      course: { id: row.course_id, name: row.course_name },
    }));

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addAssignment = async (req, res) => {
  try {
    const { title, description, due_date, course_id, status } = req.body;
    const userId = req.user.id;

    if (!title || !due_date || !course_id) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const result = await db.query(
      `INSERT INTO assignments (user_id, title, description, due_date, course_id, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, title, description, due_date, course_id, status || "todo"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, course_id, status } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `UPDATE assignments
       SET title = $1, description = $2, due_date = $3, course_id = $4, status = $5
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [title, description, due_date, course_id, status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tugas tidak ditemukan" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `DELETE FROM assignments WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tugas tidak ditemukan" });
    }

    res.status(200).json({ message: "Tugas berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `UPDATE assignments
       SET status = $1
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tugas tidak ditemukan" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating assignment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};