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
  // Per-dimension 0-100 sub-scores behind the overall score.
  breakdown?: Record<string, number>
  // Resume-specific improvement tips.
  suggestions?: string[]
  // What's already working in the resume.
  strengths?: string[]
}

export interface BreakdownIssue {
  excerpt: string
  problem: string
  fix: string
}

export interface BreakdownDetail {
  metric: string
  score: number
  verdict: 'low' | 'medium' | 'high'
  summary: string
  issues: BreakdownIssue[]
  tips: string[]
}

export interface JobsRequest {
  roles: string[]
  cities: string
  country: string
  work_types: string[]
  exp_levels: string[]
  time_filter: string
  // Which engines to run. Omit/undefined => all available. Values: 'linkedin', 'jsearch'.
  sources?: string[]
}

export interface Job {
  title: string
  company: string
  location: string
  link: string
  // Which board this listing came from (e.g. 'LinkedIn', 'Naukri', 'Indeed').
  source?: string
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

export interface MatchResult {
  score: number
  matched_skills: string[]
  missing_skills: string[]
  summary: string
  jd_skill_count: number
  // 'good fit' | 'under-qualified' | 'over-qualified' | 'unknown'
  seniority_fit?: string
}

export interface ContactInfo {
  emails: string[]
  phones: string[]
  source: string
  confidence: string
  site?: string | null
}

export interface EmailDraft {
  subject: string
  body: string
  to: string
}

export interface JobMatchRequest {
  session_id: string
  title: string
  company: string
  location?: string
  link: string
  // Optional user-supplied base email. When present, the backend personalizes
  // it for this job instead of writing one from scratch.
  email_template?: string
}

export interface JobMatchResult {
  match: MatchResult
  contact: ContactInfo
  email: EmailDraft
  description_excerpt: string
  has_description: boolean
}

export interface JobMatchStreamHandlers {
  onJd?: (hasDescription: boolean, excerpt: string) => void
  onScore?: (match: MatchResult) => void
  onContact?: (contact: ContactInfo) => void
  onEmail?: (email: EmailDraft) => void
  onDone?: () => void
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

  // Persist user-corrected skills/roles back to the session so the match score
  // and cold-email generator use the edited values (not just the displayed chips).
  static async updateResumeProfile(
    sessionId: string,
    skills: string[],
    roles?: string[],
  ): Promise<ResumeResponse> {
    const response = await fetch(`${API_BASE}/resume/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, skills, roles }),
    })
    if (!response.ok) throw new Error('Failed to update resume profile')
    return response.json()
  }

  // Drill into one score-breakdown dimension: why it scored that way, which
  // resume lines hurt it, and how to rewrite them.
  static async getBreakdownDetail(sessionId: string, metric: string): Promise<BreakdownDetail> {
    const response = await fetch(`${API_BASE}/resume/breakdown/detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, metric }),
    })
    if (!response.ok) {
      let detail = 'Failed to load the breakdown detail'
      try {
        const e = await response.json()
        if (e?.detail) detail = e.detail
      } catch { /* ignore */ }
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

  static async matchJob(request: JobMatchRequest): Promise<JobMatchResult> {
    const response = await fetch(`${API_BASE}/jobs/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      let detail = 'Failed to analyze this job'
      try {
        const e = await response.json()
        if (e?.detail) detail = e.detail
      } catch { /* ignore */ }
      throw new Error(detail)
    }
    return response.json()
  }

  // Streaming match: stages (jd, score, contact, email) arrive as they finish.
  // Falls back to the non-streaming endpoint if streaming isn't available.
  static async matchJobStream(request: JobMatchRequest, handlers: JobMatchStreamHandlers): Promise<void> {
    const fallback = async () => {
      const data = await this.matchJob(request)
      handlers.onJd?.(data.has_description, data.description_excerpt)
      handlers.onScore?.(data.match)
      handlers.onContact?.(data.contact)
      handlers.onEmail?.(data.email)
      handlers.onDone?.()
    }

    try {
      const response = await fetch(`${API_BASE}/jobs/match/stream`, {
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
        if (msg.type === 'jd') handlers.onJd?.(!!msg.has_description, msg.description_excerpt || '')
        else if (msg.type === 'score') handlers.onScore?.(msg as MatchResult)
        else if (msg.type === 'contact') handlers.onContact?.(msg as ContactInfo)
        else if (msg.type === 'email') handlers.onEmail?.(msg as EmailDraft)
        else if (msg.type === 'done') handlers.onDone?.()
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
      try {
        await fallback()
      } catch (e) {
        handlers.onError(e instanceof Error ? e.message : 'Failed to analyze this job')
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

  // Confirm whether the backend still holds this session. Returns:
  //   { exists: true }  -> session is live, cached analysis is valid
  //   { exists: false } -> backend reachable but session is gone (e.g. it
  //                        restarted) -> the cached analysis should be cleared
  //   null              -> backend unreachable; DON'T wipe (it may be starting up)
  static async getResumeSession(sessionId: string): Promise<{ ready: boolean; exists: boolean } | null> {
    if (!sessionId) return { ready: false, exists: false }
    try {
      const response = await fetch(`${API_BASE}/resume/status/${sessionId}`)
      if (!response.ok) return null
      const data = await response.json()
      return { ready: !!data.ready, exists: !!data.exists }
    } catch {
      return null
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
