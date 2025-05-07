"use client"

import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { Home, FileText, Calendar, CheckSquare, LogOut, Menu, X } from "react-feather"
import { useState } from "react"
import { api } from "../lib/api"
import toast from "react-hot-toast"

export default function Layout({ user, setUser }: { user: any; setUser: (user: any) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
      setUser(null)
      navigate("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Gagal keluar dari sistem")
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-indigo-600">TanyaJawab</h1>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <nav className="space-y-1">
            <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} end>
              <Home size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/documents" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <FileText size={18} />
              <span>Dokumen</span>
            </NavLink>
            <NavLink to="/courses" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Calendar size={18} />
              <span>Jadwal Kuliah</span>
            </NavLink>
            <NavLink to="/assignments" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <CheckSquare size={18} />
              <span>Tugas</span>
            </NavLink>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} className="mr-2" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center h-16 px-6 bg-white border-b">
          <button className="lg:hidden mr-4" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-gray-500" />
          </button>
          <h2 className="text-lg font-medium">TanyaJawab</h2>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
