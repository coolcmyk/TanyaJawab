"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { ChevronLeft, Send } from "react-feather"
import { api } from "../lib/api"
import toast from "react-hot-toast"

interface ParsedPage {
  id: string
  page_number: number
  extracted_text: string
  image_path: string | null
}

interface DocumentDetail {
  id: string
  original_filename: string
  upload_timestamp: string
  parsed_pages: ParsedPage[]
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export default function DocumentView() {
  const { id } = useParams<{ id: string }>()
  const [document, setDocument] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState("")
  const [asking, setAsking] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return

    const fetchDocument = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/documents/${id}`)
        setDocument(response.data)
      } catch (error) {
        console.error("Error fetching document:", error)
        toast.error("Gagal memuat dokumen")
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [id])

  useEffect(() => {
    // Scroll to bottom of chat when messages change
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim() || !id) return

    try {
      setAsking(true)

      // Add user message to chat
      setChatMessages([...chatMessages, { role: "user", content: question }])

      // Get answer from API
      const response = await api.post(`/documents/${id}/ask`, { question })

      // Add assistant message to chat
      setChatMessages((prev) => [...prev, { role: "assistant", content: response.data.answer }])

      // Clear question input
      setQuestion("")
    } catch (error) {
      console.error("Error asking question:", error)
      toast.error("Gagal mendapatkan jawaban")
    } finally {
      setAsking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Dokumen tidak ditemukan</h3>
        <Link to="/documents" className="text-indigo-600 hover:text-indigo-800">
          Kembali ke daftar dokumen
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/documents" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ChevronLeft size={16} className="mr-1" />
          Kembali ke daftar dokumen
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">{document.original_filename}</h1>
            <p className="text-sm text-gray-500">
              Diunggah pada {new Date(document.upload_timestamp).toLocaleDateString("id-ID")}
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {document.parsed_pages.map((page) => (
                <div key={page.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Halaman {page.page_number}</h2>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">{page.extracted_text}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow flex flex-col h-[calc(100vh-12rem)]">
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium text-gray-800">Tanya tentang Dokumen</h2>
            <p className="text-sm text-gray-500">Ajukan pertanyaan tentang isi dokumen ini</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {chatMessages.length > 0 ? (
              <div className="space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "user" ? "bg-indigo-100 text-gray-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div>
                  <p className="mb-2">Belum ada pertanyaan</p>
                  <p className="text-sm">Ajukan pertanyaan tentang dokumen ini untuk mendapatkan jawaban</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <form onSubmit={handleAskQuestion} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tanyakan sesuatu tentang dokumen ini..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={asking}
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                disabled={asking || !question.trim()}
              >
                {asking ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
