const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  (process.env.NODE_ENV === 'production'
    ? 'https://hiregenei-backend.onrender.com'
    : 'http://localhost:8000')
const API_BASE = `${DEFAULT_API_URL}/api`

export interface ResumeResponse {
  skills: string[]
  roles: string[]
}

export interface JobsRequest {
  roles: string[]
  cities: string
  country: string
  work_types: string[]
  exp_levels: string[]
  time_filter: string
}

export interface Job {
  title: string
  company: string
  location: string
  link: string
}

export interface JobsResponse {
  jobs: Job[]
  status?: string
}

export interface ChatRequest {
  message: string
}

export interface ChatResponse {
  reply: string
}

export class APIClient {
  static async uploadResume(file: File): Promise<ResumeResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE}/resume/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload resume')
    }

    return response.json()
  }

  static async scrapeJobs(request: JobsRequest): Promise<JobsResponse> {
    const response = await fetch(`${API_BASE}/jobs/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('Failed to scrape jobs')
    }

    return response.json()
  }

  static async chat(message: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error('Failed to get chat response')
    }

    return response.json()
  }
}
