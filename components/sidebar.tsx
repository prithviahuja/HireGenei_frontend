'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileText, Briefcase, MessageSquare, Menu, X } from 'lucide-react'

interface SidebarProps {
  activeTab: 'resume' | 'scraper' | 'consultant'
  onTabChange: (tab: 'resume' | 'scraper' | 'consultant') => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const tabs = [
    { id: 'resume' as const, label: 'Resume Analyzer', icon: FileText },
    { id: 'scraper' as const, label: 'Job Scraper', icon: Briefcase },
    { id: 'consultant' as const, label: 'AI Consultant', icon: MessageSquare },
  ]

  const NavContent = () => (
    <div className="flex flex-col space-y-2">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id)
              setMobileOpen(false)
            }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-secondary'
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden sticky top-0 z-50 bg-background border-b border-border p-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">HireGenei</h1>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-secondary rounded-lg"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-0 z-40 md:z-auto bg-sidebar border-r border-sidebar-border w-64 h-screen flex flex-col transition-transform md:transition-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="hidden md:block p-6 border-b border-sidebar-border">
          <h1 className="font-bold text-xl text-sidebar-foreground">HireGenei</h1>
          <p className="text-xs text-sidebar-accent-foreground mt-1">AI-Powered Job Matching</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 md:p-6 overflow-y-auto">
          <NavContent />
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 md:p-6">
          <p className="text-xs text-sidebar-accent-foreground text-center">
            v1.0.0
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
