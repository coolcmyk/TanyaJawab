const db = require('../config/databaseConfig');

exports.getUpcomingAssignments = async (userId, limit = 3) => {
  const res = await db.query(
    `SELECT a.*, c.id as course_id, c.name as course_name
     FROM assignments a
     LEFT JOIN courses c ON a.course_id = c.id
     WHERE c.user_id = $1 AND a.due_date >= NOW()
     ORDER BY a.due_date ASC
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    due_date: row.due_date,
    status: row.status,
    course: { id: row.course_id, name: row.course_name }
  }));
};