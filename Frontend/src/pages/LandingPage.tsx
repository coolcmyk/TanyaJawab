import { Link } from "react-router-dom";
import { GitHub } from "react-feather";

export default function LandingPage() {
  const githubAuthUrl = import.meta.env.VITE_GITHUB_AUTH_URL || "http://localhost:3000/auth/github";
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/Assets/landing_page_wp2.png')",
        fontFamily: "'Jetbrains Mono', monospace",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundBlendMode: "overlay",
        color: "#fff"
      }}
    >
      <div className="backdrop-blur-sm bg-white/20 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          {/* Navigation */}
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center">
              <h1 className="text-4xl font-italic" style={{ color: "#fff" }}>TanyaJawab</h1>
              <img src="/Assets/logo.png" alt="Logo" className="h-12 w-13" />

            </div>
            <div className="space-x-4">
              <Link to="/login" className="px-4 py-2 font-medium hover:text-yellow-200" style={{ color: "#fff" }}>
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg transition-colors" style={{ background: "#8B6F43", color: "#fff" }}>
                Register
              </Link>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "#fff" }}>
                Learn Smarter, Not Harder.
              </h2>
              <p className="text-lg mb-8" style={{ color: "#f3f3f3" }}>
                TanyaJawab is your AI-powered study companion, designed to help university students truly understand their course material. Upload your lecture notes, assignments, or syllabi, ask any question, and get contextual answers that make sense for your studies. We make learning more interactive, accessible, and tailored to your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary text-center" style={{ background: "#8B6F43", color: "#fff" }}>
                  Get Started
                </Link>
                <a
                  href={githubAuthUrl}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{ background: "#A98C5F", color: "#fff" }}
                >
                  <GitHub size={20} />
                  Login with GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-20">
            <div className="p-6 bg-white/50 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3" style={{ color: "#8B6F43" }}>📄 Document Intelligence</h3>
              <p style={{ color: "#8B6F43" }}>
                Effortlessly upload your lecture notes, assignments, and syllabi in PDF format. Our system automatically extracts and organizes your documents, so you can focus on learning instead of searching.
              </p>
            </div>
            <div className="p-6 bg-white/50 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3" style={{ color: "#8B6F43" }}>🔍 Smart Q&A</h3>
              <p style={{ color: "#8B6F43" }}>
                Have a question about your course material? Just ask! Our AI understands your documents and provides clear, contextual answers to help you grasp even the toughest concepts.
              </p>
            </div>
            <div className="p-6 bg-white/50 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3" style={{ color: "#8B6F43" }}>📅 Course Scheduling</h3>
              <p style={{ color: "#8B6F43" }}>
                Stay organized with a weekly class schedule, keep track of assignments and deadlines, and receive automatic reminders so you never miss an important date.
              </p>
            </div>
          </div>

          {/* Comprehensive Info Section */}
          <div className="bg-white/50 rounded-lg shadow-md p-8 my-20">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#8B6F43" }}>About TanyaJawab</h2>
            <p className="mb-4" style={{ color: "#8B6F43" }}>
              TanyaJawab is a web-based learning platform that brings the power of AI to your study routine. We help students not just memorize, but truly understand their coursework. With features like document management, smart Q&A, course scheduling, and assignment tracking, TanyaJawab is your all-in-one digital study assistant.
            </p>
            <p className="mb-4" style={{ color: "#8B6F43" }}>
              Upload and organize all your study materials in one secure place. Ask questions about your notes or assignments and get instant, relevant answers powered by advanced AI. Monitor your upcoming classes and deadlines from a personal dashboard, and enjoy peace of mind knowing your data is private and secure.
            </p>
            <p className="mb-4" style={{ color: "#8B6F43" }}>
              TanyaJawab is easy to use, integrates with GitHub for quick sign-in, and is built with modern technology to ensure a smooth and reliable experience for every student.
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-2" style={{ color: "#8B6F43" }}>Technology Behind TanyaJawab</h3>
            <ul className="list-disc pl-6" style={{ color: "#8B6F43" }}>
              <li><b>Frontend:</b> React.js, Tailwind CSS, and Three.js for interactive visuals.</li>
              <li><b>Backend:</b> Node.js/Express (or FastAPI), PostgreSQL, Qdrant, and Redis.</li>
              <li><b>AI Integration:</b> Gemini Vision API for document extraction, LLM API for intelligent answers.</li>
              <li><b>Authentication:</b> GitHub OAuth and local login system.</li>
              <li><b>Deployment:</b> Ready for Vercel, Netlify, or your own server.</li>
            </ul>
            <div className="mt-6">
              <Link to="/login" className="btn-primary mr-4" style={{ background: "#8B6F43", color: "#fff" }}>Start Now</Link>
              <a href="https://github.com/coolcmyk/TanyaJawab" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "#8B6F43" }}>View on GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}