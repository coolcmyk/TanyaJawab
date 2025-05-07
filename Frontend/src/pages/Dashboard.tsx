"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FileText, Calendar, CheckSquare, Clock } from "react-feather"
import { api } from "../lib/api"

export default function Dashboard() {
  const [todayCourses, setTodayCourses] = useState<any[]>([])
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([])
  const [recentDocuments, setRecentDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState({
    courses: true,
    assignments: true,
    documents: true,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch today's courses
        const coursesResponse = await api.get("/courses/today")
        setTodayCourses(coursesResponse.data)
        setLoading((prev) => ({ ...prev, courses: false }))

        // Fetch upcoming assignments
        const assignmentsResponse = await api.get("/assignments?status=todo&limit=3")
        setUpcomingAssignments(assignmentsResponse.data)
        setLoading((prev) => ({ ...prev, assignments: false }))

        // Fetch recent documents
        const documentsResponse = await api.get("/documents")
        setRecentDocuments(documentsResponse.data.slice(0, 3))
        setLoading((prev) => ({ ...prev, documents: false }))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading({
          courses: false,
          assignments: false,
          documents: false,
        })
      }
    }

    fetchDashboardData()
  }, [])

  const formatTime = (time: string) => {
    return time
  }

  const getDayName = () => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    return days[new Date().getDay()]
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Courses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Jadwal Hari Ini ({getDayName()})</h2>
            <Calendar size={20} className="text-indigo-500" />
          </div>

          {loading.courses ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : todayCourses.length > 0 ? (
            <div className="space-y-3">
              {todayCourses.map((course) => (
                <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800">{course.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Clock size={14} className="mr-1" />
                    {formatTime(course.start_time)} - {formatTime(course.end_time)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
              <p>Tidak ada jadwal kuliah hari ini</p>
            </div>
          )}

          <div className="mt-4">
            <Link to="/courses" className="text-sm text-indigo-600 hover:text-indigo-800">
              Lihat semua jadwal →
            </Link>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Tugas Mendatang</h2>
            <CheckSquare size={20} className="text-indigo-500" />
          </div>

          {loading.assignments ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : upcomingAssignments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{assignment.course.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Deadline: {new Date(assignment.due_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare size={32} className="mx-auto text-gray-300 mb-2" />
              <p>Tidak ada tugas mendatang</p>
            </div>
          )}

          <div className="mt-4">
            <Link to="/assignments" className="text-sm text-indigo-600 hover:text-indigo-800">
              Lihat semua tugas →
            </Link>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Dokumen Terbaru</h2>
            <FileText size={20} className="text-indigo-500" />
          </div>

          {loading.documents ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : recentDocuments.length > 0 ? (
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 truncate">{doc.original_filename}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(doc.upload_timestamp).toLocaleDateString("id-ID")}
                  </p>
                  <Link
                    to={`/documents/${doc.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                  >
                    Lihat dokumen →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText size={32} className="mx-auto text-gray-300 mb-2" />
              <p>Belum ada dokumen</p>
            </div>
          )}

          <div className="mt-4">
            <Link to="/documents" className="text-sm text-indigo-600 hover:text-indigo-800">
              Lihat semua dokumen →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
