const db = require('../config/databaseConfig');

exports.getCoursesByDay = async (userId, dayOfWeek) => {
  console.log('Fetching courses for user:', userId, 'on day:', dayOfWeek); // Debugging
  const res = await db.query(
    `SELECT * FROM courses WHERE user_id = $1 AND day_of_week = $2 ORDER BY start_time ASC`,
    [userId, dayOfWeek]
  );
  console.log('Courses fetched:', res.rows); // Debugging
  return res.rows;
};

exports.getCoursesByUser = async (userId) => {
  console.log('Fetching all courses for user:', userId); // Debugging
  const res = await db.query(
    `SELECT * FROM courses WHERE user_id = $1 ORDER BY day_of_week, start_time ASC`,
    [userId]
  );
  console.log('Courses fetched:', res.rows); // Debugging
  return res.rows;
};