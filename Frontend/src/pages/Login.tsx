"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../lib/api"
import toast from "react-hot-toast"
import { GitHub } from "react-feather"

export default function Login({ setUser }: { setUser: (user: any) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  // Get the GitHub auth URL from environment variables
  const githubAuthUrl = import.meta.env.VITE_GITHUB_AUTH_URL || "http://localhost:3000/auth/github";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data.token;
      console.log("Token diterima:", token); // Debugging
      if (token) {
        localStorage.setItem("auth_token", token);
        setUser(response.data.user);
        toast.success("Login berhasil");
        navigate("/dashboard");
      } else {
        throw new Error("Token tidak ditemukan");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login gagal. Periksa email dan password Anda.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h1 className="text-center text-3xl font-bold text-indigo-600">TanyaJawab</h1>
          <h2 className="mt-6 text-center text-2xl font-medium text-gray-900">Masuk ke akun Anda</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button type="submit" className="w-full btn-primary" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </div>
        </form>
        
        {/* GitHub login button */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau</span>
            </div>
          </div>
          
          <div className="mt-4">
            <a
              href={githubAuthUrl}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <GitHub size={20} />
              Login dengan GitHub
            </a>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Daftar
            </Link>
          </p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-xs text-center text-gray-500">Untuk demo, gunakan email apapun dengan password apapun</p>
        </div>
      </div>
    </div>
  )
}