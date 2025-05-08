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
import LandingPage from "./pages/LandingPage"
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

  // Handle GitHub Auth callback
  useEffect(() => {
    // Check if we're on the callback URL with a token parameter
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    
    if (window.location.pathname === '/auth/callback' && token) {
      // Save the token
      localStorage.setItem('auth_token', token);
      
      // Get user info using the token
      const fetchUser = async () => {
        try {
          // Set the token in the API instance
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const response = await api.get('/auth/me');
          setUser(response.data);
          
          // Redirect to dashboard
          window.location.href = '/';
        } catch (error) {
          console.error('Error fetching user data:', error);
          window.location.href = '/login';
        }
      };
      
      fetchUser();
      return;
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register setUser={setUser} />} />
      <Route path="/auth/callback" element={<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3">Processing authentication...</p>
      </div>} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={user ? <Layout user={user} setUser={setUser}><Dashboard /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/documents" element={user ? <Layout user={user} setUser={setUser}><Documents /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/documents/:id" element={user ? <Layout user={user} setUser={setUser}><DocumentView /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/courses" element={user ? <Layout user={user} setUser={setUser}><Courses /></Layout> : <Navigate to="/login" replace />} />
      <Route path="/assignments" element={user ? <Layout user={user} setUser={setUser}><Assignments /></Layout> : <Navigate to="/login" replace />} />
    </Routes>
  )
}