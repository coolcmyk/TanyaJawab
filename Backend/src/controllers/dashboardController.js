const Course = require('../models/courseModel');
const Assignment = require('../models/assignmentModel');
const Document = require('../models/documentModel');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Today's courses
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) - 6 (Saturday)
    const courses = await Course.getCoursesByDay(userId, dayOfWeek);

    // Upcoming assignments (limit 3, status todo)
    const assignments = await Assignment.getUpcomingAssignments(userId, 3);

    // Recent documents (limit 3)
    const documents = await Document.getRecentDocuments(userId, 3);

    res.json({
      todayCourses: courses,
      upcomingAssignments: assignments,
      recentDocuments: documents,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};