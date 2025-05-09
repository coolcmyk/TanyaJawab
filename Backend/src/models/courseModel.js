const db = require('../config/databaseConfig');

exports.getCoursesByDay = async (userId, dayOfWeek) => {
  const res = await db.query(
    `SELECT * FROM courses WHERE user_id = $1 AND day_of_week = $2 ORDER BY start_time ASC`,
    [userId, dayOfWeek]
  );
  return res.rows;
};