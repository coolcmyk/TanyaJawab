const Course = require('../models/courseModel');
const Assignment = require('../models/assignmentModel');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id; // Data user dari middleware auth
    const dayOfWeek = new Date().getDay(); // Hari ini (0 = Minggu, 1 = Senin, dst.)

    const todayCourses = await Course.getCoursesByDay(userId, dayOfWeek);
    const upcomingAssignments = await Assignment.getUpcomingAssignments(userId);

    res.status(200).json({
      todayCourses,
      upcomingAssignments,
      recentDocuments: [], // Tambahkan jika ada dokumen
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};