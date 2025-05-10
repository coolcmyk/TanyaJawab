const db = require('../config/databaseConfig');

exports.getUpcomingAssignments = async (userId, limit = 3) => {
  const res = await db.query(
    `SELECT a.*, c.name as course_name
     FROM assignments a
     LEFT JOIN courses c ON a.course_id = c.id
     WHERE a.user_id = $1 AND a.due_date >= NOW()
     ORDER BY a.due_date ASC
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows.map(row => ({
    ...row,
    course: { name: row.course_name }
  }));
};