"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FileText, Upload, Search, Trash2 } from "react-feather"
import { api } from "../lib/api"
import toast from "react-hot-toast"

interface Document {
  id: string
  original_filename: string
  upload_timestamp: string
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.get("/documents")
      setDocuments(response.data)
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast.error("Gagal memuat dokumen")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)

      // For preview version, we'll just simulate the upload
      const response = await api.post("/documents/upload", { get: () => files[0] })

      setDocuments([response.data, ...documents])
      toast.success("Dokumen berhasil diunggah")
    } catch (error) {
      console.error("Error uploading document:", error)
      toast.error("Gagal mengunggah dokumen")
    } finally {
      setUploading(false)
      // Reset the file input
      event.target.value = ""
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return

    try {
      await api.delete(`/documents/${id}`)
      setDocuments(documents.filter((doc) => doc.id !== id))
      toast.success("Dokumen berhasil dihapus")
    } catch (error) {
      console.error("Error deleting document:", error)
      toast.error("Gagal menghapus dokumen")
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Dokumen Saya</h1>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari dokumen..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <label className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
              <Upload className="mr-2" size={18} />
              Unggah Dokumen
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 p-4 flex items-center justify-center border-b">
                  <FileText size={48} className="text-indigo-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 truncate">{doc.original_filename}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(doc.upload_timestamp).toLocaleDateString("id-ID")}
                  </p>
                  <div className="flex mt-4 space-x-2">
                    <Link
                      to={`/documents/${doc.id}`}
                      className="flex-1 px-4 py-2 text-sm text-center font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      Lihat
                    </Link>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Belum ada dokumen</h3>
            <p className="text-gray-500 mb-6">Unggah dokumen PDF untuk mulai menggunakan fitur RAG</p>
            <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
              <Upload className="mr-2" size={18} />
              Unggah Dokumen
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}