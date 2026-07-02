'use client'

import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { APIClient } from '@/lib/api'
import type { Job, ResumeResponse } from '@/lib/api'

type StoredResume = (ResumeResponse & { fileName?: string }) | null

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  id: string
}

// The consultant's opening greeting — also the initial chat state.
export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: '0',
    role: 'assistant',
    content:
      "Hi — I'm your HireGenei career consultant.\n\nI can help you with:\n- **Career advice** and role recommendations\n- **Resume feedback** and improvement tips\n- **Skill gap analysis** for your target roles\n- **Salary negotiation** strategies\n\nWhat would you like to figure out today?",
  },
]

interface RolesContextValue {
  roles: string[]
  setRoles: (roles: string[]) => void
  sessionId: string | null
  setSessionId: (id: string | null) => void
  // Resume analysis result — lifted here so it survives page navigation.
  resume: StoredResume
  setResume: (r: StoredResume) => void
  // Scraped jobs — lifted here so navigating away & back doesn't lose them.
  jobs: Job[]
  setJobs: Dispatch<SetStateAction<Job[]>>
  // Optional user-supplied email draft/template. When set, it's used as the
  // base for every job's tailored email (the model personalizes it per job);
  // when empty the backend auto-writes one from scratch. Lifted here so the
  // jobs page (where it's entered) and the match modal (where it's used) share it.
  emailTemplate: string
  setEmailTemplate: (t: string) => void
  // Consultant chat history — lifted here so it survives page navigation.
  chatMessages: ChatMessage[]
  setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>
}

const RolesContext = createContext<RolesContextValue>({
  roles: [],
  setRoles: () => {},
  sessionId: null,
  setSessionId: () => {},
  resume: null,
  setResume: () => {},
  jobs: [],
  setJobs: () => {},
  emailTemplate: '',
  setEmailTemplate: () => {},
  chatMessages: [],
  setChatMessages: () => {},
})

const ROLES_KEY = 'hg_matched_roles'
const SESSION_KEY = 'hg_session_id'
const RESUME_KEY = 'hg_resume_result'
const TEMPLATE_KEY = 'hg_email_template'

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRolesState] = useState<string[]>([])
  const [sessionId, setSessionIdState] = useState<string | null>(null)
  const [resume, setResumeState] = useState<StoredResume>(null)
  // Jobs are kept in memory only (can be large + transient). Living in this
  // layout-level provider is enough to survive client-side navigation.
  const [jobs, setJobs] = useState<Job[]>([])
  const [emailTemplate, setEmailTemplateState] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT)

  // Restore within the SAME app session only. We use sessionStorage (not
  // localStorage) on purpose: it survives in-app tab navigation and manual page
  // reloads, but is wiped when the browser/app is closed — so reopening the app
  // starts fresh instead of showing a stale resume + score from a past session
  // (whose backend in-memory session no longer exists anyway).
  useEffect(() => {
    let restoredSession: string | null = null
    let hadResume = false
    try {
      // One-time cleanup: purge stale data the old build wrote to localStorage,
      // which used to survive app restarts (the bug we're fixing).
      localStorage.removeItem(ROLES_KEY)
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(RESUME_KEY)

      const savedRoles = sessionStorage.getItem(ROLES_KEY)
      if (savedRoles) setRolesState(JSON.parse(savedRoles))
      const savedSession = sessionStorage.getItem(SESSION_KEY)
      if (savedSession) { setSessionIdState(savedSession); restoredSession = savedSession }
      const savedResume = sessionStorage.getItem(RESUME_KEY)
      if (savedResume) { setResumeState(JSON.parse(savedResume)); hadResume = true }
      const savedTemplate = sessionStorage.getItem(TEMPLATE_KEY)
      if (savedTemplate) setEmailTemplateState(savedTemplate)
    } catch {
      /* ignore */
    }

    // The backend keeps sessions in MEMORY only — they're wiped on restart. If
    // some browsers (e.g. "continue where you left off") restore sessionStorage
    // across an app close, we'd show a resume analysis the backend can no longer
    // back, then fail the moment the user tries to match a job. So whenever we
    // restored a cached resume/session, confirm the backend still has it; if it's
    // gone, clear the analysis up front instead of showing a phantom one.
    if (!restoredSession && !hadResume) return
    let cancelled = false

    const wipe = () => {
      if (cancelled) return
      setResumeState(null)
      setSessionIdState(null)
      try {
        sessionStorage.removeItem(RESUME_KEY)
        sessionStorage.removeItem(SESSION_KEY)
      } catch { /* ignore */ }
    }

    // A resume cached without a usable session can't be validated or used — drop it.
    if (hadResume && !restoredSession) { wipe(); return }

    ;(async () => {
      const status = await APIClient.getResumeSession(restoredSession || '')
      // null => backend unreachable; leave the cache alone (it may be starting up).
      if (status && !status.exists) wipe()
    })()

    return () => { cancelled = true }
  }, [])

  // Memoised so consumers can safely list them in effect/callback deps without
  // causing re-render churn (the modal's match effect depends on these).
  const setRoles = useCallback((next: string[]) => {
    setRolesState(next)
    try {
      sessionStorage.setItem(ROLES_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const setSessionId = useCallback((id: string | null) => {
    setSessionIdState(id)
    try {
      if (id) sessionStorage.setItem(SESSION_KEY, id)
      else sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const setResume = useCallback((r: StoredResume) => {
    setResumeState(r)
    try {
      if (r) sessionStorage.setItem(RESUME_KEY, JSON.stringify(r))
      else sessionStorage.removeItem(RESUME_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const setEmailTemplate = useCallback((t: string) => {
    setEmailTemplateState(t)
    try {
      if (t.trim()) sessionStorage.setItem(TEMPLATE_KEY, t)
      else sessionStorage.removeItem(TEMPLATE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <RolesContext.Provider value={{ roles, setRoles, sessionId, setSessionId, resume, setResume, jobs, setJobs, emailTemplate, setEmailTemplate, chatMessages, setChatMessages }}>
      {children}
    </RolesContext.Provider>
  )
}

export function useRoles() {
  return useContext(RolesContext)
}
