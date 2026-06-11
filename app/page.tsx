'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ResumeAnalyzer } from '@/components/resume-analyzer'
import { JobScraper } from '@/components/job-scraper'
import { AIConsultant } from '@/components/ai-consultant'
import { ResumeResponse } from '@/lib/api'
import { Search, FileText, Briefcase, MessageSquare, Sparkles } from 'lucide-react'

const PAGE_META = {
  resume: {
    title: 'Resume Analyzer',
    subtitle: 'Extract your skills and surface the roles that fit you best',
    icon: FileText,
    badge: 'AI-Powered',
  },
  scraper: {
    title: 'Job Discovery',
    subtitle: 'Pull live listings tuned to your profile and filters',
    icon: Briefcase,
    badge: 'Live Scraper',
  },
  consultant: {
    title: 'AI Consultant',
    subtitle: 'A career coach on call, whenever you need a second opinion',
    icon: MessageSquare,
    badge: 'Chat',
  },
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'resume' | 'scraper' | 'consultant'>('resume')
  const [analyzerData, setAnalyzerData] = useState<ResumeResponse | null>(null)

  const meta = PAGE_META[activeTab]
  const Icon = meta.icon

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-border/50"
          style={{ background: 'oklch(0.145 0.006 64 / 0.82)', backdropFilter: 'blur(14px)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl bg-primary/12 text-primary border border-primary/20 flex-shrink-0">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold tracking-tight truncate font-display">{meta.title}</h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/12 text-accent border border-accent/20">
                  <Sparkles className="h-2.5 w-2.5" />
                  {meta.badge}
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-muted-foreground truncate mt-0.5">{meta.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150">
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted/60 border border-border/60">⌘K</kbd>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/85 to-accent/70 flex items-center justify-center text-[11px] font-semibold text-[#241c0e] shadow-[0_0_14px_oklch(0.81_0.13_82/0.35)] cursor-pointer hover:shadow-[0_0_20px_oklch(0.81_0.13_82/0.55)] transition-shadow">
              U
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto dotgrid ${activeTab === 'consultant' ? '' : 'p-6'}`}>
          <div className={activeTab === 'consultant' ? 'h-full' : 'max-w-5xl mx-auto fade-in'}>
            {activeTab === 'resume' && (
              <ResumeAnalyzer onAnalyzed={(data) => setAnalyzerData(data)} />
            )}
            {activeTab === 'scraper' && (
              <JobScraper defaultRoles={analyzerData?.roles || []} />
            )}
            {activeTab === 'consultant' && <AIConsultant />}
          </div>
        </div>
      </main>
    </div>
  )
}
