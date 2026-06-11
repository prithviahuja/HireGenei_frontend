'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { FileText, Briefcase, MessageSquare, Menu, X, ChevronLeft, Sparkles } from 'lucide-react'

interface SidebarProps {
  activeTab: 'resume' | 'scraper' | 'consultant'
  onTabChange: (tab: 'resume' | 'scraper' | 'consultant') => void
}

function LampMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_16px_oklch(0.81_0.13_82/0.5)]',
        className
      )}
    >
      <Sparkles className="h-3.5 w-3.5 text-[#241c0e]" />
    </span>
  )
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const tabs = [
    {
      id: 'resume' as const,
      label: 'Resume Analyzer',
      icon: FileText,
      description: 'Extract skills & roles',
    },
    {
      id: 'scraper' as const,
      label: 'Job Discovery',
      icon: Briefcase,
      description: 'Find matching jobs',
    },
    {
      id: 'consultant' as const,
      label: 'AI Consultant',
      icon: MessageSquare,
      description: 'Career guidance',
    },
  ]

  const NavContent = () => (
    <nav className="flex flex-col gap-1.5 px-3">
      {!collapsed && (
        <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">
          Workspace
        </p>
      )}
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id)
              setMobileOpen(false)
            }}
            title={collapsed ? tab.label : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full text-left',
              isActive
                ? 'bg-primary/12 text-primary shadow-[inset_0_0_0_1px_oklch(0.81_0.13_82/0.28)]'
                : 'text-sidebar-foreground/65 hover:bg-white/[0.04] hover:text-sidebar-foreground'
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.81_0.13_82/0.7)]" />
            )}
            <span
              className={cn(
                'flex-shrink-0 p-1.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary/18 text-primary'
                  : 'text-sidebar-foreground/45 group-hover:text-sidebar-foreground group-hover:bg-white/[0.04]'
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="leading-tight truncate">{tab.label}</span>
                <span className="text-[11px] text-muted-foreground/70 truncate">{tab.description}</span>
              </div>
            )}
          </button>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-sidebar-border"
        style={{ background: 'oklch(0.128 0.006 62)' }}
      >
        <div className="flex items-center gap-2.5">
          <LampMark className="w-7 h-7" />
          <span className="font-semibold text-[15px] gradient-text font-display">HireGenei</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg hover:bg-white/[0.05] text-muted-foreground"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-0 z-40 md:z-auto h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border',
          collapsed ? 'md:w-[72px]' : 'md:w-[238px]',
          mobileOpen ? 'translate-x-0 w-[238px]' : '-translate-x-full md:translate-x-0'
        )}
        style={{ background: 'var(--sidebar)' }}
      >
        {/* Logo */}
        <div
          className={cn(
            'hidden md:flex items-center border-b border-sidebar-border transition-all duration-300',
            collapsed ? 'justify-center px-0 py-[18px]' : 'gap-2.5 px-5 py-[18px]'
          )}
        >
          <LampMark className="w-8 h-8 flex-shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="font-bold text-[16px] gradient-text leading-none font-display">HireGenei</h1>
              <p className="text-[10px] text-muted-foreground mt-1 tracking-wide">Your AI career genie</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4">
          <NavContent />
        </div>

        {/* Tip card */}
        {!collapsed && (
          <div className="px-3 pb-2">
            <div className="glass-card rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold">Pro tip</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Analyze your resume first — Job Discovery auto-fills with your matched roles.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'hidden md:flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-all duration-200',
              collapsed ? 'justify-center' : ''
            )}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
          {!collapsed && (
            <p className="text-[10px] text-muted-foreground/40 text-center mt-2 font-mono">v1.0.0</p>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
