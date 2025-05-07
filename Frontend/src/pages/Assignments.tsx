"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CheckSquare, Clock, Edit, Trash2, Plus, X } from "react-feather"
import { api } from "../lib/api"
import toast from "react-hot-toast"

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  status: "todo" | "in_progress" | "done"
  course: {
    id: string
    name: string
  }
}

interface Course {
  id: string
  name: string
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    course_id: "",
    status: "todo",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch assignments
      const assignmentsResponse = await api.get("/assignments")
      setAssignments(assignmentsResponse.data)

      // Fetch courses for the dropdown
      const coursesResponse = await api.get("/courses")
      setCourses(coursesResponse.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  const openModal = (assignment: Assignment | null = null) => {
    if (assignment) {
      setEditingAssignment(assignment)
      setFormData({
        title: assignment.title,
        description: assignment.description,
        due_date: new Date(assignment.due_date).toISOString().split("T")[0],
        course_id: assignment.course.id,
        status: assignment.status,
      })
    } else {
      setEditingAssignment(null)
      setFormData({
        title: "",
        description: "",
        due_date: new Date().toISOString().split("T")[0],
        course_id: courses.length > 0 ? courses[0].id : "",
        status: "todo",
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAssignment(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingAssignment) {
        // Update existing assignment
        const response = await api.put(`/assignments/${editingAssignment.id}`, formData)
        setAssignments(assignments.map((a) => (a.id === editingAssignment.id ? response.data : a)))
        toast.success("Tugas berhasil diperbarui")
      } else {
        // Create new assignment
        const response = await api.post("/assignments", formData)
        setAssignments([...assignments, response.data])
        toast.success("Tugas berhasil ditambahkan")
      }
      closeModal()
    } catch (error) {
      console.error("Error saving assignment:", error)
      toast.error("Gagal menyimpan tugas")
    }
  }

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return

    try {
      await api.delete(`/assignments/${id}`)
      setAssignments(assignments.filter((a) => a.id !== id))
      toast.success("Tugas berhasil dihapus")
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast.error("Gagal menghapus tugas")
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await api.patch(`/assignments/${id}/status`, { status })
      setAssignments(assignments.map((a) => (a.id === id ? response.data : a)))
      toast.success("Status tugas berhasil diperbarui")
    } catch (error) {
      console.error("Error updating assignment status:", error)
      toast.error("Gagal memperbarui status tugas")
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true
    return assignment.status === filter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "todo":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Belum Dikerjakan</span>
      case "in_progress":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Sedang Dikerjakan</span>
      case "done":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Selesai</span>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Daftar Tugas</h1>

          <div className="flex flex-col md:flex-row gap-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">Semua Tugas</option>
              <option value="todo">Belum Dikerjakan</option>
              <option value="in_progress">Sedang Dikerjakan</option>
              <option value="done">Selesai</option>
            </select>

            <button
              onClick={() => openModal()}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus size={18} className="mr-2" />
              Tambah Tugas
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredAssignments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{assignment.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{assignment.course.name}</p>
                    <div className="mt-2">{getStatusBadge(assignment.status)}</div>
                  </div>

                  <div className="flex items-center mt-4 md:mt-0">
                    <div className="flex items-center text-sm text-gray-500 mr-4">
                      <Clock size={16} className="mr-1" />
                      {new Date(assignment.due_date).toLocaleDateString("id-ID")}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(assignment)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {assignment.description && (
                  <div className="mt-3 text-sm text-gray-600 border-t pt-3">
                    <p>{assignment.description}</p>
                  </div>
                )}

                {assignment.status !== "done" && (
                  <div className="mt-4 pt-3 border-t flex justify-end">
                    {assignment.status === "todo" ? (
                      <button
                        onClick={() => handleStatusChange(assignment.id, "in_progress")}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mulai Mengerjakan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(assignment.id, "done")}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        Tandai Selesai
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Belum ada tugas</h3>
            <p className="text-gray-500 mb-6">Tambahkan tugas untuk mulai mengatur pekerjaan Anda</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="mr-2" size={18} />
              Tambah Tugas
            </button>
          </div>
        )}
      </div>

      {/* Modal for adding/editing assignment */}
      {isModalOpen &&
        (
          <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingAssignment ? "Edit Tugas" : "Tambah Tugas"}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Judul Tugas
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="form-input"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="form-input"
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Kuliah
                    </label>
                    <select
                      id="course_id"
                      name="course_id"
                      className="form-input"
                      value={formData.course_id}
                      onChange={handleInputChange}
                      required
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Deadline
                    </label>
                    <input
                      type="date"
                      id="due_date"
                      name="due_date"
                      className="form-input"
                      value={formData.due_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="form-input"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="todo">Belum Dikerjakan</option>
                      <option value="in_progress">Sedang Dikerjakan</option>
                      <option value="done">Selesai</option>
                    </select>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn-secondary"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editingAssignment ? "Perbarui" : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        )}
    </div>
  )
}
