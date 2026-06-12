'use client'

import { AIConsultant } from '@/components/ai-consultant'
import { useRoles } from '@/components/roles-provider'
import { MessageSquare } from 'lucide-react'

export default function ConsultantPage() {
  const { sessionId } = useRoles()

  return (
    <div className="container-site py-14">
      <div className="max-w-2xl mb-8">
        <span className="eyebrow mb-3">
          <MessageSquare className="h-3.5 w-3.5" />
          AI Consultant
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight">Talk to your career genie</h1>
        <p className="mt-3 text-muted-foreground">
          {sessionId
            ? 'Your resume is loaded — ask about skill gaps, role fit, or how to stand out.'
            : 'Ask about skill gaps, resume feedback, salary negotiation, or your next move. Upload a resume for tailored answers.'}
        </p>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden h-[74vh] min-h-[540px]">
        <AIConsultant sessionId={sessionId || undefined} />
      </div>
    </div>
  )
}
