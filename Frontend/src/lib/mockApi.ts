// Mock data for frontend preview
import { v4 as uuidv4 } from "uuid"

// Types
interface User {
  id: string
  name: string
  email: string
}

interface Document {
  id: string
  original_filename: string
  upload_timestamp: string
}

interface ParsedPage {
  id: string
  page_number: number
  extracted_text: string
  image_path: string | null
}

interface DocumentDetail extends Document {
  parsed_pages: ParsedPage[]
}

interface Course {
  id: string
  name: string
  day_of_week: number
  start_time: string
  end_time: string
}

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  status: "todo" | "in_progress" | "done"
  course: {
    id: string
    name: string
  }
}

// Mock data storage
let currentUser: User | null = null
let documents: Document[] = [
  {
    id: "doc-1",
    original_filename: "Algoritma dan Struktur Data.pdf",
    upload_timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-2",
    original_filename: "Kalkulus II.pdf",
    upload_timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-3",
    original_filename: "Pemrograman Web.pdf",
    upload_timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const documentDetails: Record<string, DocumentDetail> = {
  "doc-1": {
    id: "doc-1",
    original_filename: "Algoritma dan Struktur Data.pdf",
    upload_timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    parsed_pages: [
      {
        id: "page-1-1",
        page_number: 1,
        extracted_text:
          "# Algoritma dan Struktur Data\n\nAlgoritma adalah urutan langkah-langkah logis penyelesaian masalah yang disusun secara sistematis. Struktur data adalah cara penyimpanan, pengorganisasian, dan pengaturan data di dalam media penyimpanan komputer sehingga data tersebut dapat digunakan secara efisien.\n\n## Kompleksitas Algoritma\n\nKompleksitas algoritma dibagi menjadi:\n1. Time Complexity: Waktu yang dibutuhkan untuk menjalankan algoritma\n2. Space Complexity: Ruang memori yang dibutuhkan algoritma",
        image_path: null,
      },
      {
        id: "page-1-2",
        page_number: 2,
        extracted_text:
          "## Struktur Data Dasar\n\n### Array\nArray adalah struktur data yang menyimpan elemen-elemen dengan tipe data yang sama dan terurut. Elemen array diakses menggunakan indeks.\n\n### Linked List\nLinked list adalah struktur data yang terdiri dari node-node yang saling terhubung. Setiap node memiliki data dan pointer ke node berikutnya.\n\n### Stack\nStack adalah struktur data LIFO (Last In First Out) dimana elemen yang terakhir dimasukkan akan pertama kali dikeluarkan.",
        image_path: null,
      },
      {
        id: "page-1-3",
        page_number: 3,
        extracted_text:
          "### Queue\nQueue adalah struktur data FIFO (First In First Out) dimana elemen yang pertama dimasukkan akan pertama kali dikeluarkan.\n\n### Tree\nTree adalah struktur data hierarkis yang terdiri dari node-node yang saling terhubung. Setiap tree memiliki root node dan setiap node dapat memiliki child node.\n\n### Graph\nGraph adalah struktur data yang terdiri dari vertex (node) dan edge (sisi) yang menghubungkan antar vertex.",
        image_path: null,
      },
    ],
  },
  "doc-2": {
    id: "doc-2",
    original_filename: "Kalkulus II.pdf",
    upload_timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    parsed_pages: [
      {
        id: "page-2-1",
        page_number: 1,
        extracted_text:
          "# Kalkulus II\n\n## Integral Tak Tentu\n\nIntegral tak tentu dari fungsi f(x) adalah fungsi F(x) sedemikian sehingga F'(x) = f(x). Ditulis sebagai:\n\n∫f(x)dx = F(x) + C\n\ndimana C adalah konstanta integrasi.\n\n## Rumus Dasar Integral\n\n1. ∫x^n dx = (x^(n+1))/(n+1) + C, n ≠ -1\n2. ∫e^x dx = e^x + C\n3. ∫1/x dx = ln|x| + C",
        image_path: null,
      },
      {
        id: "page-2-2",
        page_number: 2,
        extracted_text:
          "## Integral Tentu\n\nIntegral tentu dari fungsi f(x) dari a ke b adalah:\n\n∫[a,b] f(x)dx = F(b) - F(a)\n\ndimana F(x) adalah antiturunan dari f(x).\n\n## Teorema Dasar Kalkulus\n\nJika f adalah fungsi kontinu pada [a,b] dan F adalah antiturunan dari f, maka:\n\n∫[a,b] f(x)dx = F(b) - F(a)",
        image_path: null,
      },
    ],
  },
  "doc-3": {
    id: "doc-3",
    original_filename: "Pemrograman Web.pdf",
    upload_timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    parsed_pages: [
      {
        id: "page-3-1",
        page_number: 1,
        extracted_text:
          "# Pemrograman Web\n\n## HTML (Hypertext Markup Language)\n\nHTML adalah bahasa markup standar untuk membuat halaman web. HTML mendeskripsikan struktur halaman web secara semantik.\n\nContoh kode HTML dasar:\n```html\n<!DOCTYPE html>\n<html>\n<head>\n  <title>Judul Halaman</title>\n</head>\n<body>\n  <h1>Heading</h1>\n  <p>Paragraf.</p>\n</body>\n</html>\n```",
        image_path: null,
      },
      {
        id: "page-3-2",
        page_number: 2,
        extracted_text:
          "## CSS (Cascading Style Sheets)\n\nCSS adalah bahasa yang digunakan untuk menggambarkan tampilan dan format dokumen yang ditulis dalam bahasa markup seperti HTML.\n\nContoh kode CSS dasar:\n```css\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  color: blue;\n}\n```",
        image_path: null,
      },
      {
        id: "page-3-3",
        page_number: 3,
        extracted_text:
          "## JavaScript\n\nJavaScript adalah bahasa pemrograman yang memungkinkan implementasi fitur-fitur kompleks pada halaman web.\n\nContoh kode JavaScript dasar:\n```javascript\nfunction sayHello() {\n  alert('Hello, World!');\n}\n\ndocument.getElementById('button').addEventListener('click', sayHello);\n```",
        image_path: null,
      },
    ],
  },
}

let courses: Course[] = [
  {
    id: "course-1",
    name: "Algoritma dan Struktur Data",
    day_of_week: 1, // Monday
    start_time: "08:00",
    end_time: "09:30",
  },
  {
    id: "course-2",
    name: "Kalkulus II",
    day_of_week: 2, // Tuesday
    start_time: "10:00",
    end_time: "11:30",
  },
  {
    id: "course-3",
    name: "Pemrograman Web",
    day_of_week: 3, // Wednesday
    start_time: "13:00",
    end_time: "14:30",
  },
  {
    id: "course-4",
    name: "Basis Data",
    day_of_week: 4, // Thursday
    start_time: "15:00",
    end_time: "16:30",
  },
]

let assignments: Assignment[] = [
  {
    id: "assignment-1",
    title: "Implementasi Linked List",
    description: "Buatlah implementasi linked list dalam bahasa Java atau Python",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "todo",
    course: {
      id: "course-1",
      name: "Algoritma dan Struktur Data",
    },
  },
  {
    id: "assignment-2",
    title: "Soal Integral",
    description: "Kerjakan soal integral halaman 45-47",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "in_progress",
    course: {
      id: "course-2",
      name: "Kalkulus II",
    },
  },
  {
    id: "assignment-3",
    title: "Membuat Website Portfolio",
    description: "Buatlah website portfolio pribadi menggunakan HTML, CSS, dan JavaScript",
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "todo",
    course: {
      id: "course-3",
      name: "Pemrograman Web",
    },
  },
  {
    id: "assignment-4",
    title: "Normalisasi Database",
    description: "Lakukan normalisasi pada skema database yang diberikan",
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "done",
    course: {
      id: "course-4",
      name: "Basis Data",
    },
  },
]

// Chat messages for document Q&A
const chatMessages: Record<string, Array<{ role: "user" | "assistant"; content: string }>> = {
  "doc-1": [],
  "doc-2": [],
  "doc-3": [],
}

// Mock API implementation
export const mockApi = {
  // Auth
  getMe: async () => {
    return (
      currentUser || {
        id: "user-1",
        name: "Mahasiswa Demo",
        email: "demo@student.ac.id",
      }
    )
  },

  login: async (email?: string, password?: string) => {
    currentUser = {
      id: "user-1",
      name: "Mahasiswa Demo",
      email: email || "demo@student.ac.id",
    }
    return { user: currentUser }
  },

  register: async (name?: string, email?: string, password?: string) => {
    currentUser = {
      id: "user-1",
      name: name || "Mahasiswa Demo",
      email: email || "demo@student.ac.id",
    }
    return { user: currentUser }
  },

  logout: async () => {
    currentUser = null
    return {}
  },

  // Documents
  getDocuments: async () => {
    return documents
  },

  getDocument: async (id: string) => {
    return (
      documentDetails[id] || {
        id,
        original_filename: "Document Not Found",
        upload_timestamp: new Date().toISOString(),
        parsed_pages: [],
      }
    )
  },

  uploadDocument: async (file?: File) => {
    const newDoc = {
      id: `doc-${uuidv4()}`,
      original_filename: file?.name || "New Uploaded Document.pdf",
      upload_timestamp: new Date().toISOString(),
    }

    documents.unshift(newDoc)

    documentDetails[newDoc.id] = {
      ...newDoc,
      parsed_pages: [
        {
          id: `page-${uuidv4()}`,
          page_number: 1,
          extracted_text:
            "This is a sample extracted text from the newly uploaded document. In a real application, this text would be extracted from the PDF using Gemini Vision API.",
          image_path: null,
        },
      ],
    }

    return newDoc
  },

  deleteDocument: async (id: string) => {
    documents = documents.filter((doc) => doc.id !== id)
    delete documentDetails[id]
    return {}
  },

  askDocument: async (id: string, question: string) => {
    // Generate a mock answer based on the document and question
    let answer = "Maaf, saya tidak dapat menemukan informasi yang relevan dalam dokumen ini."

    if (!chatMessages[id]) {
      chatMessages[id] = []
    }

    chatMessages[id].push({ role: "user", content: question })

    const doc = documentDetails[id]
    if (doc) {
      const allText = doc.parsed_pages.map((page) => page.extracted_text).join(" ")

      // Simple keyword matching for demo purposes
      if (id === "doc-1") {
        if (question.toLowerCase().includes("algoritma")) {
          answer = "Algoritma adalah urutan langkah-langkah logis penyelesaian masalah yang disusun secara sistematis."
        } else if (question.toLowerCase().includes("struktur data")) {
          answer =
            "Struktur data adalah cara penyimpanan, pengorganisasian, dan pengaturan data di dalam media penyimpanan komputer sehingga data tersebut dapat digunakan secara efisien."
        } else if (question.toLowerCase().includes("kompleksitas")) {
          answer =
            "Kompleksitas algoritma dibagi menjadi: 1) Time Complexity: Waktu yang dibutuhkan untuk menjalankan algoritma, dan 2) Space Complexity: Ruang memori yang dibutuhkan algoritma."
        } else if (question.toLowerCase().includes("array")) {
          answer =
            "Array adalah struktur data yang menyimpan elemen-elemen dengan tipe data yang sama dan terurut. Elemen array diakses menggunakan indeks."
        } else if (question.toLowerCase().includes("linked list")) {
          answer =
            "Linked list adalah struktur data yang terdiri dari node-node yang saling terhubung. Setiap node memiliki data dan pointer ke node berikutnya."
        }
      } else if (id === "doc-2") {
        if (question.toLowerCase().includes("integral")) {
          answer =
            "Integral tak tentu dari fungsi f(x) adalah fungsi F(x) sedemikian sehingga F'(x) = f(x). Ditulis sebagai: ∫f(x)dx = F(x) + C, dimana C adalah konstanta integrasi."
        } else if (question.toLowerCase().includes("rumus")) {
          answer =
            "Beberapa rumus dasar integral: 1) ∫x^n dx = (x^(n+1))/(n+1) + C, n ≠ -1, 2) ∫e^x dx = e^x + C, 3) ∫1/x dx = ln|x| + C"
        } else if (question.toLowerCase().includes("teorema")) {
          answer =
            "Teorema Dasar Kalkulus: Jika f adalah fungsi kontinu pada [a,b] dan F adalah antiturunan dari f, maka: ∫[a,b] f(x)dx = F(b) - F(a)"
        }
      } else if (id === "doc-3") {
        if (question.toLowerCase().includes("html")) {
          answer =
            "HTML adalah bahasa markup standar untuk membuat halaman web. HTML mendeskripsikan struktur halaman web secara semantik."
        } else if (question.toLowerCase().includes("css")) {
          answer =
            "CSS adalah bahasa yang digunakan untuk menggambarkan tampilan dan format dokumen yang ditulis dalam bahasa markup seperti HTML."
        } else if (question.toLowerCase().includes("javascript")) {
          answer =
            "JavaScript adalah bahasa pemrograman yang memungkinkan implementasi fitur-fitur kompleks pada halaman web."
        }
      }
    }

    chatMessages[id].push({ role: "assistant", content: answer })

    return { answer }
  },

  // Courses
  getCourses: async () => {
    return courses
  },

  getTodayCourses: async () => {
  const today = new Date().getDay();
  const adjustedDay = today === 0 ? 0 : today;
  const todayCourses = courses.filter((course) => course.day_of_week === adjustedDay);
  console.log("Today Courses:", todayCourses);
  return todayCourses;
},

  createCourse: async (data: any) => {
    const newCourse = {
      id: `course-${uuidv4()}`,
      name: data.name,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
    }

    courses.push(newCourse)
    return newCourse
  },

  updateCourse: async (id: string, data: any) => {
    const index = courses.findIndex((course) => course.id === id)
    if (index !== -1) {
      courses[index] = {
        ...courses[index],
        name: data.name,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
      }
      return courses[index]
    }
    return null
  },

  deleteCourse: async (id: string) => {
    courses = courses.filter((course) => course.id !== id)
    // Also remove assignments for this course
    assignments = assignments.filter((assignment) => assignment.course.id !== id)
    return {}
  },

  // Assignments
  getAssignments: async (status?: string, limit?: number) => {
    let filtered = assignments

    if (status) {
      filtered = filtered.filter((a) => a.status === status)
    }

    if (limit) {
      filtered = filtered.slice(0, limit)
    }

    return filtered
  },

  createAssignment: async (data: any) => {
    const course = courses.find((c) => c.id === data.course_id)

    if (!course) {
      throw new Error("Course not found")
    }

    const newAssignment = {
      id: `assignment-${uuidv4()}`,
      title: data.title,
      description: data.description || "",
      due_date: data.due_date,
      status: data.status || "todo",
      course: {
        id: course.id,
        name: course.name,
      },
    }

    assignments.push(newAssignment)
    return newAssignment
  },

  updateAssignment: async (id: string, data: any) => {
    const index = assignments.findIndex((assignment) => assignment.id === id)

    if (index !== -1) {
      const course = courses.find((c) => c.id === data.course_id)

      if (!course) {
        throw new Error("Course not found")
      }

      assignments[index] = {
        ...assignments[index],
        title: data.title,
        description: data.description || "",
        due_date: data.due_date,
        status: data.status,
        course: {
          id: course.id,
          name: course.name,
        },
      }

      return assignments[index]
    }

    return null
  },

  updateAssignmentStatus: async (id: string, status: string) => {
    const index = assignments.findIndex((assignment) => assignment.id === id)

    if (index !== -1) {
      assignments[index] = {
        ...assignments[index],
        status: status as "todo" | "in_progress" | "done",
      }

      return assignments[index]
    }

    return null
  },

  deleteAssignment: async (id: string) => {
    assignments = assignments.filter((assignment) => assignment.id !== id)
    return {}
  },
}
