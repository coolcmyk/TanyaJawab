"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar, Clock, Edit, Trash2, Plus, X } from "react-feather"
import { api } from "../lib/api"
import toast from "react-hot-toast"

interface Course {
  id: string
  name: string
  day_of_week: number
  start_time: string
  end_time: string
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    day_of_week: 1,
    start_time: "08:00",
    end_time: "09:30",
  })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          console.error("Token tidak ditemukan di localStorage");
          toast.error("Anda harus login terlebih dahulu");
          window.location.href = "/login"; // Redirect ke login jika token tidak ada
          return;
        }

        console.log("Token yang dikirim:", token); // Debugging
        const response = await api.get("/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Data courses dari API:", response.data); // Debugging
        setCourses(response.data); // Pastikan data diatur ke state
        setLoading(false); // Hentikan loading spinner
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Gagal memuat jadwal kuliah");
        setLoading(false); // Hentikan loading spinner meskipun terjadi error
      }
    };

    fetchCourses();
  }, []);

  const openModal = (course: Course | null = null) => {
    if (course) {
      setEditingCourse(course)
      setFormData({
        name: course.name,
        day_of_week: course.day_of_week,
        start_time: course.start_time,
        end_time: course.end_time,
      })
    } else {
      setEditingCourse(null)
      setFormData({
        name: "",
        day_of_week: 1,
        start_time: "08:00",
        end_time: "09:30",
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCourse(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "day_of_week" ? Number.parseInt(value) : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCourse) {
        // Update existing course
        const response = await api.put(`/courses/${editingCourse.id}`, formData);
        setCourses(courses.map((c) => (c.id === editingCourse.id ? response.data : c)));
        toast.success("Jadwal kuliah berhasil diperbarui");
      } else {
        // Create new course
        const response = await api.post("/courses", formData);
        setCourses([...courses, response.data]);
        toast.success("Jadwal kuliah berhasil ditambahkan");
      }
      closeModal();
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Gagal menyimpan jadwal kuliah");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal kuliah ini?")) return

    try {
      await api.delete(`/courses/${id}`)
      setCourses(courses.filter((c) => c.id !== id))
      toast.success("Jadwal kuliah berhasil dihapus")
    } catch (error) {
      console.error("Error deleting course:", error)
      toast.error("Gagal menghapus jadwal kuliah")
    }
  }

  const getDayName = (day: number) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    return days[day]
  }

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Jadwal Kuliah</h1>

          <button
            onClick={() => openModal()}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={18} className="mr-2" />
            Tambah Jadwal
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mata Kuliah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hari
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={16} className="mr-2" />
                        {getDayName(course.day_of_week)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={16} className="mr-2" />
                        {course.start_time} - {course.end_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(course)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Belum ada jadwal kuliah</h3>
            <p className="text-gray-500 mb-6">Tambahkan jadwal kuliah untuk mulai mengatur waktu belajar Anda</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="mr-2" size={18} />
              Tambah Jadwal
            </button>
          </div>
        )}
      </div>

      {/* Modal for adding/editing course */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingCourse ? "Edit Jadwal Kuliah" : "Tambah Jadwal Kuliah"}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Mata Kuliah
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">
                      Hari
                    </label>
                    <select
                      id="day_of_week"
                      name="day_of_week"
                      className="form-input"
                      value={formData.day_of_week}
                      onChange={handleInputChange}
                      required
                    >
                      <option value={0}>Minggu</option>
                      <option value={1}>Senin</option>
                      <option value={2}>Selasa</option>
                      <option value={3}>Rabu</option>
                      <option value={4}>Kamis</option>
                      <option value={5}>Jumat</option>
                      <option value={6}>Sabtu</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                        Waktu Mulai
                      </label>
                      <input
                        type="time"
                        id="start_time"
                        name="start_time"
                        className="form-input"
                        value={formData.start_time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                        Waktu Selesai
                      </label>
                      <input
                        type="time"
                        id="end_time"
                        name="end_time"
                        className="form-input"
                        value={formData.end_time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={closeModal} className="btn-secondary">
                      Batal
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingCourse ? "Perbarui" : "Simpan"}
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