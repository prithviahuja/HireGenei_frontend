'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ResumeAnalyzer } from '@/components/resume-analyzer'
import { JobScraper } from '@/components/job-scraper'
import { AIConsultant } from '@/components/ai-consultant'
import { ResumeResponse } from '@/lib/api'
import { Bell, Search, FileText, Briefcase, MessageSquare, Sparkles } from 'lucide-react'

const PAGE_META = {
  resume: {
    title: 'Resume Analyzer',
    subtitle: 'Upload your resume to extract skills and find matching roles',
    icon: FileText,
    badge: 'AI-Powered',
  },
  scraper: {
    title: 'Job Discovery',
    subtitle: 'Find and filter job listings tailored to your profile',
    icon: Briefcase,
    badge: 'Live Scraper',
  },
  consultant: {
    title: 'AI Consultant',
    subtitle: 'Get personalized career advice from your AI career coach',
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
        {/* Top Navbar */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-border/40"
                style={{ background: 'oklch(0.11 0.015 255 / 0.95)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary flex-shrink-0">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold truncate">{meta.title}</h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/15 text-primary border border-primary/20">
                  <Sparkles className="h-2.5 w-2.5" />
                  {meta.badge}
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-muted-foreground truncate">{meta.subtitle}</p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150">
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/50 border border-border/50">⌘K</kbd>
            </button>
            <button className="relative p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            {/* User avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-accent/60 flex items-center justify-center text-[11px] font-semibold text-white shadow-[0_0_10px_oklch(0.65_0.22_270/0.3)] cursor-pointer hover:shadow-[0_0_16px_oklch(0.65_0.22_270/0.5)] transition-shadow">
              U
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${activeTab === 'consultant' ? '' : 'p-6'}`}>
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
