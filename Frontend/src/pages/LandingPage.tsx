import { Link } from "react-router-dom";
import { GitHub } from "react-feather";

export default function LandingPage() {
  // Get the GitHub auth URL from environment variables
  const githubAuthUrl = import.meta.env.VITE_GITHUB_AUTH_URL || "http://localhost:3000/auth/github"  
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
              <Link
                to="/register"
                className="btn-primary text-center"
              >
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
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="/placeholder-logo.svg" 
              alt="TanyaJawab Platform" 
              className="max-w-md w-full"
            />
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-20">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">📄 Document Intelligence</h3>
            <p className="text-gray-600">
              Unggah catatan kuliah, tugas, dan silabus dalam format PDF.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">🔍 Smart Q&A</h3>
            <p className="text-gray-600">
              Tanyakan pertanyaan tentang dokumen dan dapatkan jawaban kontekstual.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">📅 Course Scheduling</h3>
            <p className="text-gray-600">
              Kelola jadwal kelas mingguan dan track tugas dengan deadline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}