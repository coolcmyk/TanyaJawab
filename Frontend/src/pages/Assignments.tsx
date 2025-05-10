"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Clock, Edit, Trash2, Plus, X } from "react-feather";
import { api } from "../lib/api";
import toast from "react-hot-toast";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: "todo" | "in_progress" | "done";
  course: {
    id: string;
    name: string;
  };
}

interface Course {
  id: string;
  name: string;
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    course_id: "",
    status: "todo",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get("/assignments");
        setAssignments(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast.error("Gagal memuat tugas");
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Gagal memuat mata kuliah");
      }
    };

    fetchAssignments();
    fetchCourses();
  }, []);

  const openModal = (assignment: Assignment | null = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        due_date: assignment.due_date,
        course_id: assignment.course.id,
        status: assignment.status,
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        title: "",
        description: "",
        due_date: "",
        course_id: "",
        status: "todo",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAssignment(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (editingAssignment) {
      await api.put(`/assignments/${editingAssignment.id}`, formData);
      toast.success("Tugas berhasil diperbarui");
    } else {
      await api.post("/assignments", formData);
      toast.success("Tugas berhasil ditambahkan");
    }
    closeModal();
    fetchAssignments(); // Panggil ulang untuk sinkronisasi
  } catch (error) {
    console.error("Error saving assignment:", error);
    toast.error("Gagal menyimpan tugas");
  }
};
  

  const handleDeleteAssignment = async (id: string) => {
  if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;

  try {
    await api.delete(`/assignments/${id}`);
    setAssignments(assignments.filter((a) => a.id !== id)); // Hapus tugas dari state
    toast.success("Tugas berhasil dihapus");
  } catch (error) {
    console.error("Error deleting assignment:", error);
    toast.error("Gagal menghapus tugas");
  }
};

 const handleStatusChange = async (id: string, status: string) => {
  try {
    const response = await api.patch(`/assignments/${id}/status`, { status });
    setAssignments(assignments.map((a) => (a.id === id ? response.data : a))); // Perbarui status di state
    toast.success("Status tugas berhasil diperbarui");
  } catch (error) {
    console.error("Error updating assignment status:", error);
    toast.error("Gagal memperbarui status tugas");
  }
};

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true;
    return assignment.status === filter;
  });

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Daftar Tugas</h1>
      <div className="flex justify-between mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border rounded px-4 py-2"
        >
          <option value="all">Semua</option>
          <option value="todo">Belum Dikerjakan</option>
          <option value="in_progress">Sedang Dikerjakan</option>
          <option value="done">Selesai</option>
        </select>
        <button onClick={() => openModal()} className="bg-blue-500 text-white px-4 py-2 rounded">
          <Plus size={16} /> Tambah Tugas
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="p-4 border rounded shadow">
              <h2 className="text-lg font-semibold">{assignment.title}</h2>
              <p className="text-sm text-gray-600">{assignment.course.name}</p>
              <p className="text-sm text-gray-600">{assignment.description}</p>
              <p className="text-sm text-gray-600 flex items-center">
                <Clock size={14} className="mr-1" /> {assignment.due_date}
              </p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleStatusChange(assignment.id, "done")}
                  className="text-green-600 hover:text-green-800"
                >
                  Tandai Selesai
                </button>
                <button
                  onClick={() => openModal(assignment)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>Tidak ada tugas</div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingAssignment ? "Edit Tugas" : "Tambah Tugas"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Judul</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Tenggat</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Mata Kuliah</label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Pilih Mata Kuliah</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Batal
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
