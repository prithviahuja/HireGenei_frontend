const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  (process.env.NODE_ENV === 'production'
    ? 'https://hiregenei-backend.onrender.com'
    : 'http://localhost:8000')
const API_BASE = `${DEFAULT_API_URL}/api`

export interface ResumeResponse {
  skills: string[]
  roles: string[]
  score?: number
  session_id?: string
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
  session_id?: string
}

export interface ChatResponse {
  reply: string
}

export interface JobStreamHandlers {
  onJob: (job: Job) => void
  onDone: (total: number) => void
  onWarning?: (message: string) => void
  onError: (message: string) => void
  signal?: AbortSignal
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
      let detail = 'Failed to upload resume'
      try {
        const e = await response.json()
        if (e?.detail) detail = e.detail
      } catch {
        /* ignore */
      }
      throw new Error(detail)
    }

    return response.json()
  }

  static async scrapeJobs(request: JobsRequest): Promise<JobsResponse> {
    const response = await fetch(`${API_BASE}/jobs/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('Failed to scrape jobs')
    }

    return response.json()
  }

  // Streaming scrape: jobs are delivered the moment they're found (NDJSON).
  // Falls back to the non-streaming endpoint if streaming isn't available.
  static async scrapeJobsStream(request: JobsRequest, handlers: JobStreamHandlers): Promise<void> {
    const fallback = async () => {
      const data = await this.scrapeJobs(request)
      data.jobs.forEach((j) => handlers.onJob(j))
      handlers.onDone(data.jobs.length)
    }

    try {
      const response = await fetch(`${API_BASE}/jobs/scrape/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: handlers.signal,
      })

      if (!response.ok || !response.body) {
        await fallback()
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const handleLine = (line: string) => {
        const trimmed = line.trim()
        if (!trimmed) return
        let msg: any
        try {
          msg = JSON.parse(trimmed)
        } catch {
          return
        }
        if (msg.type === 'job') handlers.onJob(msg.job)
        else if (msg.type === 'warning') handlers.onWarning?.(msg.detail)
        else if (msg.type === 'done') handlers.onDone(msg.total)
        else if (msg.type === 'error') handlers.onError(msg.detail)
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let nl: number
        while ((nl = buffer.indexOf('\n')) >= 0) {
          handleLine(buffer.slice(0, nl))
          buffer = buffer.slice(nl + 1)
        }
      }
      if (buffer.trim()) handleLine(buffer)
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return
      // Network/streaming issue — try the non-streaming endpoint before erroring.
      try {
        await fallback()
      } catch (e) {
        handlers.onError(e instanceof Error ? e.message : 'Failed to scrape jobs')
      }
    }
  }

  static async getResumeStatus(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/resume/status/${sessionId}`)
      if (!response.ok) return false
      const data = await response.json()
      return !!data.ready
    } catch {
      return false
    }
  }

  static async chat(message: string, sessionId?: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId }),
    })

    if (!response.ok) {
      throw new Error('Failed to get chat response')
    }

    return response.json()
  }
}
