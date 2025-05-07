"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Documents from "./pages/Documents"
import DocumentView from "./pages/DocumentView"
import Courses from "./pages/Courses"
import Assignments from "./pages/Assignments"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { api } from "./lib/api"

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me")
        setUser(response.data)
      } catch (error) {
        console.error("Not authenticated", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register setUser={setUser} />} />
      <Route path="/" element={user ? <Layout user={user} setUser={setUser} /> : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="documents" element={<Documents />} />
        <Route path="documents/:id" element={<DocumentView />} />
        <Route path="courses" element={<Courses />} />
        <Route path="assignments" element={<Assignments />} />
      </Route>
    </Routes>
  )
}
