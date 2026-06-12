'use client'

import { AIConsultant } from '@/components/ai-consultant'
import { MessageSquare } from 'lucide-react'

export default function ConsultantPage() {
  return (
    <div className="container-site py-14">
      <div className="max-w-2xl mb-8">
        <span className="eyebrow mb-3">
          <MessageSquare className="h-3.5 w-3.5" />
          AI Consultant
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight">Talk to your career genie</h1>
        <p className="mt-3 text-muted-foreground">
          Ask about skill gaps, resume feedback, salary negotiation, or your next move.
        </p>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden h-[74vh] min-h-[540px]">
        <AIConsultant />
      </div>
    </div>
  )
}
