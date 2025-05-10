const db = require('../config/databaseConfig');

exports.getAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT a.*, c.id as course_id, c.name as course_name
       FROM assignments a
       LEFT JOIN courses c ON a.course_id = c.id
       WHERE c.user_id = $1
       ORDER BY a.due_date ASC`,
      [userId]
    );

    const assignments = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      due_date: row.due_date,
      status: row.status,
      course: {
        id: row.course_id,
        name: row.course_name,
      },
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
    if (!title || !due_date || !course_id) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }
    // Check course ownership
    const courseCheck = await db.query(
      `SELECT * FROM courses WHERE id = $1 AND user_id = $2`,
      [course_id, req.user.id]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ message: "Anda tidak memiliki akses ke mata kuliah ini" });
    }
    const result = await db.query(
      `INSERT INTO assignments (title, description, due_date, course_id, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, due_date, course_id, status || "todo"]
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
    // Check assignment ownership via course
    const assignmentCheck = await db.query(
      `SELECT a.* FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );
    if (assignmentCheck.rows.length === 0) {
      return res.status(404).json({ message: "Tugas tidak ditemukan" });
    }
    const result = await db.query(
      `UPDATE assignments
       SET title = $1, description = $2, due_date = $3, course_id = $4, status = $5
       WHERE id = $6 RETURNING *`,
      [title, description, due_date, course_id, status, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    // Check assignment ownership via course
    const assignmentCheck = await db.query(
      `SELECT a.* FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );
    if (assignmentCheck.rows.length === 0) {
      return res.status(404).json({ message: "Tugas tidak ditemukan" });
    }
    await db.query(`DELETE FROM assignments WHERE id = $1`, [id]);
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
    // Check assignment ownership via course
    const assignmentCheck = await db.query(
      `SELECT a.* FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );
    if (assignmentCheck.rows.length === 0) {
      return res.status(404).json({ message: "Tugas tidak ditemukan" });
    }
    const result = await db.query(
      `UPDATE assignments SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating assignment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};