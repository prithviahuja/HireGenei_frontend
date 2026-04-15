'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { FileText, Briefcase, MessageSquare, Menu, X, ChevronLeft, Sparkles, Zap } from 'lucide-react'

interface SidebarProps {
  activeTab: 'resume' | 'scraper' | 'consultant'
  onTabChange: (tab: 'resume' | 'scraper' | 'consultant') => void
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
      color: 'oklch(0.65 0.22 270)',
    },
    {
      id: 'scraper' as const,
      label: 'Job Discovery',
      icon: Briefcase,
      description: 'Find matching jobs',
      color: 'oklch(0.72 0.18 190)',
    },
    {
      id: 'consultant' as const,
      label: 'AI Consultant',
      icon: MessageSquare,
      description: 'Career guidance',
      color: 'oklch(0.68 0.20 340)',
    },
  ]

  const NavContent = () => (
    <nav className="flex flex-col gap-1.5 px-3">
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
                ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_oklch(0.65_0.22_270/0.3)]'
                : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground'
            )}
          >
            {/* Active pill indicator */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary" />
            )}

            {/* Icon */}
            <span
              className={cn(
                'flex-shrink-0 p-1.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground group-hover:bg-white/5'
              )}
            >
              <Icon className="h-4 w-4" />
            </span>

            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="leading-tight truncate">{tab.label}</span>
                <span className="text-xs text-muted-foreground/70 truncate">{tab.description}</span>
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
      <div className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border/40"
           style={{ background: 'oklch(0.12 0.015 255)' }}>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="font-semibold text-sm gradient-text">HireGenei</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-0 z-40 md:z-auto h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border',
          collapsed ? 'md:w-[68px]' : 'md:w-[230px]',
          mobileOpen ? 'translate-x-0 w-[230px]' : '-translate-x-full md:translate-x-0'
        )}
        style={{ background: 'var(--sidebar)' }}
      >
        {/* Logo area */}
        <div className={cn(
          'hidden md:flex items-center border-b border-sidebar-border transition-all duration-300',
          collapsed ? 'justify-center px-0 py-4' : 'gap-2.5 px-4 py-4'
        )}>
          <span className="w-7 h-7 flex-shrink-0 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_12px_oklch(0.65_0.22_270/0.5)]">
            <Zap className="h-3.5 w-3.5 text-white" />
          </span>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-[15px] gradient-text leading-none">HireGenei</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">AI Career Platform</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4">
          <NavContent />
        </div>

        {/* Footer / collapse toggle */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'hidden md:flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-200',
              collapsed ? 'justify-center' : ''
            )}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
          {!collapsed && (
            <p className="text-[10px] text-muted-foreground/40 text-center mt-2">v1.0.0</p>
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
