'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface RolesContextValue {
  roles: string[]
  setRoles: (roles: string[]) => void
}

const RolesContext = createContext<RolesContextValue>({
  roles: [],
  setRoles: () => {},
})

const STORAGE_KEY = 'hg_matched_roles'

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRolesState] = useState<string[]>([])

  // Restore any previously matched roles so navigating between pages keeps them
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setRolesState(JSON.parse(saved))
    } catch {
      /* ignore */
    }
  }, [])

  const setRoles = (next: string[]) => {
    setRolesState(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  return (
    <RolesContext.Provider value={{ roles, setRoles }}>
      {children}
    </RolesContext.Provider>
  )
}

export function useRoles() {
  return useContext(RolesContext)
}
