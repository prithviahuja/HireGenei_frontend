'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface RolesContextValue {
  roles: string[]
  setRoles: (roles: string[]) => void
  sessionId: string | null
  setSessionId: (id: string | null) => void
}

const RolesContext = createContext<RolesContextValue>({
  roles: [],
  setRoles: () => {},
  sessionId: null,
  setSessionId: () => {},
})

const ROLES_KEY = 'hg_matched_roles'
const SESSION_KEY = 'hg_session_id'

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRolesState] = useState<string[]>([])
  const [sessionId, setSessionIdState] = useState<string | null>(null)

  // Restore across page navigation
  useEffect(() => {
    try {
      const savedRoles = localStorage.getItem(ROLES_KEY)
      if (savedRoles) setRolesState(JSON.parse(savedRoles))
      const savedSession = localStorage.getItem(SESSION_KEY)
      if (savedSession) setSessionIdState(savedSession)
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

  return (
    <RolesContext.Provider value={{ roles, setRoles, sessionId, setSessionId }}>
      {children}
    </RolesContext.Provider>
  )
}

export function useRoles() {
  return useContext(RolesContext)
}
