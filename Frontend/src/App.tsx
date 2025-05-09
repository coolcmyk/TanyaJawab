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
import path from "path";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // Only fetch user if token exists and user is not set
    if (!user && token) {
      const fetchUser = async () => {
        try {
          const response = await api.get("/auth/me");
          const userData = response.data;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          console.log("User loaded", userData);
        } catch (error) {
          setUser(null);
          localStorage.removeItem("auth_token");
          console.error("Failed to fetch user", error);
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

  const protectedRoutes = [
    { path: "/dashboard", element: <Layout user={user} setUser={setUser}><Dashboard /></Layout> },
    { path: "/documents", element: <Layout user={user} setUser={setUser}><Documents /></Layout> },
    { path: "/documents/:id", element: <Layout user={user} setUser={setUser}><DocumentView /></Layout> },
    { path: "/courses", element: <Layout user={user} setUser={setUser}><Courses /></Layout> },
    { path: "/assignments", element: <Layout user={user} setUser={setUser}><Assignments /></Layout> },
  ];

  const requireAuth = (element: JSX.Element) => {
    console.log("requireAuth", user);
    return user ? element : <Navigate to="/login" state={{ from: location }} replace />;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register setUser={setUser} />} />
      <Route path="/oauth-callback" element={<AuthCallback setUser={setUser} />} />

      {/* Protected Routes */}
      {/* <Route path="/dashboard" element={requireAuth(<Dashboard />)} /> */}
      {/* <Route path="/dashboard" element={requireAuth(<Layout user={user} setUser={setUser}><Dashboard /></Layout>)} /> */}
      {protectedRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={requireAuth(element)} />
      ))}
    </Routes>
  );
}
