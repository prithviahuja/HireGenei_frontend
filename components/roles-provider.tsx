'use client'

import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
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
      "Hi — I'm your HireGenei career consultant ✨\n\nI can help you with:\n- **Career advice** and role recommendations\n- **Resume feedback** and improvement tips\n- **Skill gap analysis** for your target roles\n- **Salary negotiation** strategies\n\nWhat would you like to figure out today?",
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
  chatMessages: [],
  setChatMessages: () => {},
})

const ROLES_KEY = 'hg_matched_roles'
const SESSION_KEY = 'hg_session_id'
const RESUME_KEY = 'hg_resume_result'

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRolesState] = useState<string[]>([])
  const [sessionId, setSessionIdState] = useState<string | null>(null)
  const [resume, setResumeState] = useState<StoredResume>(null)
  // Jobs are kept in memory only (can be large + transient). Living in this
  // layout-level provider is enough to survive client-side navigation.
  const [jobs, setJobs] = useState<Job[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT)

  // Restore across page navigation / reloads.
  useEffect(() => {
    try {
      const savedRoles = localStorage.getItem(ROLES_KEY)
      if (savedRoles) setRolesState(JSON.parse(savedRoles))
      const savedSession = localStorage.getItem(SESSION_KEY)
      if (savedSession) setSessionIdState(savedSession)
      const savedResume = localStorage.getItem(RESUME_KEY)
      if (savedResume) setResumeState(JSON.parse(savedResume))
    } catch {
      /* ignore */
    }
  }, [])

  const setRoles = (next: string[]) => {
    setRolesState(next)
    try {
      localStorage.setItem(ROLES_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const setSessionId = (id: string | null) => {
    setSessionIdState(id)
    try {
      if (id) localStorage.setItem(SESSION_KEY, id)
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }

  const setResume = (r: StoredResume) => {
    setResumeState(r)
    try {
      if (r) localStorage.setItem(RESUME_KEY, JSON.stringify(r))
      else localStorage.removeItem(RESUME_KEY)
    } catch {
      /* ignore */
    }
  }

  return (
    <RolesContext.Provider value={{ roles, setRoles, sessionId, setSessionId, resume, setResume, jobs, setJobs, chatMessages, setChatMessages }}>
      {children}
    </RolesContext.Provider>
  )
}

export function useRoles() {
  return useContext(RolesContext)
}
