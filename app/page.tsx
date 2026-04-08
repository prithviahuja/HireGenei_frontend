'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ResumeAnalyzer } from '@/components/resume-analyzer'
import { JobScraper } from '@/components/job-scraper'
import { AIConsultant } from '@/components/ai-consultant'
import { ResumeResponse } from '@/lib/api'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'resume' | 'scraper' | 'consultant'>('resume')
  const [analyzerData, setAnalyzerData] = useState<ResumeResponse | null>(null)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 bg-card">
          <h2 className="text-lg font-semibold">
            {activeTab === 'resume' && 'Resume Analyzer'}
            {activeTab === 'scraper' && 'Job Scraper'}
            {activeTab === 'consultant' && 'AI Job Consultant'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {activeTab === 'resume' && 'Upload and analyze your resume to extract skills and find matching roles'}
            {activeTab === 'scraper' && 'Search for job openings based on your preferences'}
            {activeTab === 'consultant' && 'Chat with an AI consultant for career advice'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl">
            {activeTab === 'resume' && (
              <ResumeAnalyzer
                onAnalyzed={(data) => {
                  setAnalyzerData(data)
                }}
              />
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
