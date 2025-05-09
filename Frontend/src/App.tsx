"use client";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import DocumentView from "./pages/DocumentView";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import AuthCallback from "./components/AuthCallback";
import { api, axiosInstance} from "./lib/api";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Only fetch user if token exists and user is not set
    if (!user && token) {
      const fetchUser = async () => {
        try {
          const response = await api.get("/auth/me");
          setUser(response.data);
        } catch (error) {
          setUser(null);
          localStorage.removeItem("auth_token");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
    }
    // Only run on mount and when token changes
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const requireAuth = (element: JSX.Element) =>
    user ? element : <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register setUser={setUser} />} />
      <Route path="/oauth-callback" element={<AuthCallback setUser={setUser} />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={requireAuth(<Layout user={user} setUser={setUser}><Dashboard /></Layout>)} />
      <Route path="/documents" element={requireAuth(<Layout user={user} setUser={setUser}><Documents /></Layout>)} />
      <Route path="/documents/:id" element={requireAuth(<Layout user={user} setUser={setUser}><DocumentView /></Layout>)} />
      <Route path="/courses" element={requireAuth(<Layout user={user} setUser={setUser}><Courses /></Layout>)} />
      <Route path="/assignments" element={requireAuth(<Layout user={user} setUser={setUser}><Assignments /></Layout>)} />
    </Routes>
  );
}
