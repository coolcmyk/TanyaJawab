import { mockApi } from "./mockApi"

// Use mock API for the preview version
export const api = {
  get: async (url: string) => {
    // Handle mock API requests
    if (url === "/auth/me") return { data: await mockApi.getMe() }
    if (url === "/documents") return { data: await mockApi.getDocuments() }
    if (url.match(/^\/documents\/[^/]+$/)) {
      const id = url.split("/")[2]
      return { data: await mockApi.getDocument(id) }
    }
    if (url === "/courses") return { data: await mockApi.getCourses() }
    if (url === "/courses/today") return { data: await mockApi.getTodayCourses() }
    if (url === "/assignments") return { data: await mockApi.getAssignments() }
    if (url.match(/^\/assignments\?status=([^&]+)&limit=(\d+)$/)) {
      const match = url.match(/^\/assignments\?status=([^&]+)&limit=(\d+)$/)
      if (match) {
        const status = match[1]
        const limit = Number.parseInt(match[2])
        return { data: await mockApi.getAssignments(status, limit) }
      }
    }

    throw new Error(`Unhandled mock GET request: ${url}`)
  },

  post: async (url: string, data?: any) => {
    // Handle mock API requests
    if (url === "/auth/login") return { data: await mockApi.login(data?.email, data?.password) }
    if (url === "/auth/register") return { data: await mockApi.register(data?.name, data?.email, data?.password) }
    if (url === "/auth/logout") return { data: await mockApi.logout() }
    if (url === "/documents/upload") return { data: await mockApi.uploadDocument(data?.get?.("file")) }
    if (url.match(/^\/documents\/[^/]+\/ask$/)) {
      const id = url.split("/")[2]
      return { data: await mockApi.askDocument(id, data?.question) }
    }
    if (url === "/courses") return { data: await mockApi.createCourse(data) }
    if (url === "/assignments") return { data: await mockApi.createAssignment(data) }

    throw new Error(`Unhandled mock POST request: ${url}`)
  },

  put: async (url: string, data: any) => {
    // Handle mock API requests
    if (url.match(/^\/courses\/[^/]+$/)) {
      const id = url.split("/")[2]
      return { data: await mockApi.updateCourse(id, data) }
    }
    if (url.match(/^\/assignments\/[^/]+$/)) {
      const id = url.split("/")[2]
      return { data: await mockApi.updateAssignment(id, data) }
    }

    throw new Error(`Unhandled mock PUT request: ${url}`)
  },

  patch: async (url: string, data: any) => {
    // Handle mock API requests
    if (url.match(/^\/assignments\/[^/]+\/status$/)) {
      const id = url.split("/")[2]
      return { data: await mockApi.updateAssignmentStatus(id, data.status) }
    }

    throw new Error(`Unhandled mock PATCH request: ${url}`)
  },

  delete: async (url: string) => {
    // Handle mock API requests
    if (url.match(/^\/documents\/[^/]+$/)) {
      const id = url.split("/")[2]
      return { data: await mockApi.deleteDocument(id) }
    }
    if (url.match(/^\/courses\/[^/]+$/)) {
      const id = url.split("/")[2]
      return { data: await mockApi.deleteCourse(id) }
    }
    if (url.match(/^\/assignments\/[^/]+$/)) {
      const id = url.split("/")[2]
      return { data: await mockApi.deleteAssignment(id) }
    }

    throw new Error(`Unhandled mock DELETE request: ${url}`)
  },
}
