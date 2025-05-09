import { Link } from "react-router-dom";
import { GitHub } from "react-feather";

export default function LandingPage() {
  const githubAuthUrl = import.meta.env.VITE_GITHUB_AUTH_URL || "http://localhost:3000/auth/github";
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold text-indigo-600">TanyaJawab</h1>
          <div className="space-x-4">
            <Link to="/login" className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Register
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Belajar Lebih Efektif dengan AI
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              TanyaJawab membantu mahasiswa memahami materi kuliah dengan teknologi AI canggih. Unggah dokumen, tanyakan pertanyaan, dan dapatkan jawaban yang kontekstual.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-center">
                Daftar Sekarang
              </Link>
              <a
                href={githubAuthUrl}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <GitHub size={20} />
                Login dengan GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-20">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">📄 Document Intelligence</h3>
            <p className="text-gray-600">
              Unggah catatan kuliah, tugas, dan silabus dalam format PDF. Sistem akan mengekstrak dan mengelola konten dokumen Anda secara otomatis.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">🔍 Smart Q&A</h3>
            <p className="text-gray-600">
              Tanyakan pertanyaan tentang dokumen dan dapatkan jawaban kontekstual berbasis AI yang memahami isi dokumen Anda.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">📅 Course Scheduling</h3>
            <p className="text-gray-600">
              Kelola jadwal kelas mingguan, track tugas dengan deadline, dan dapatkan pengingat otomatis.
            </p>
          </div>
        </div>

        {/* Comprehensive Info Section */}
        <div className="bg-white rounded-lg shadow-md p-8 my-20">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Tentang TanyaJawab</h2>
          <p className="text-gray-700 mb-4">
            TanyaJawab adalah platform pembelajaran berbasis web yang mengintegrasikan teknologi AI untuk membantu mahasiswa memahami materi kuliah secara lebih efektif. Dengan fitur unggulan seperti manajemen dokumen, tanya jawab cerdas, penjadwalan kuliah, dan pelacakan tugas, TanyaJawab menjadi asisten belajar digital yang lengkap.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><b>Upload & Organize:</b> Simpan semua dokumen kuliah Anda di satu tempat, mudah dicari dan diakses kapan saja.</li>
            <li><b>AI-powered Q&A:</b> Ajukan pertanyaan tentang materi kuliah, tugas, atau catatan, dan dapatkan jawaban yang relevan secara instan.</li>
            <li><b>Personal Dashboard:</b> Pantau jadwal kuliah, tugas mendatang, dan dokumen terbaru dalam satu tampilan dashboard.</li>
            <li><b>Secure & Private:</b> Data Anda aman, hanya Anda yang dapat mengakses dokumen dan riwayat tanya jawab Anda.</li>
            <li><b>Integrasi GitHub:</b> Login mudah dan aman menggunakan akun GitHub Anda.</li>
          </ul>
          <h3 className="text-xl font-semibold text-indigo-700 mt-6 mb-2">Teknologi di Balik TanyaJawab</h3>
          <ul className="list-disc pl-6 text-gray-700">
            <li><b>Frontend:</b> React.js, Tailwind CSS, Three.js untuk visualisasi interaktif.</li>
            <li><b>Backend:</b> Node.js/Express (atau FastAPI, lihat README), PostgreSQL, Qdrant, Redis.</li>
            <li><b>AI Integration:</b> Gemini Vision API untuk ekstraksi dokumen, LLM API untuk jawaban cerdas.</li>
            <li><b>Authentication:</b> GitHub OAuth dan sistem login lokal.</li>
            <li><b>Deployment:</b> Siap untuk deployment di Vercel, Netlify, atau server sendiri.</li>
          </ul>
          <div className="mt-6">
            <Link to="/register" className="btn-primary mr-4">Mulai Sekarang</Link>
            <a href="https://github.com/coolcmyk/TanyaJawab" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Lihat di GitHub</a>
          </div>
        </div>
      </div>
    </div>
  );
}