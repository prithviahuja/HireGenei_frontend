'use client'

import { ResumeAnalyzer } from '@/components/resume-analyzer'
import { useRoles } from '@/components/roles-provider'
import { FileText } from 'lucide-react'

export default function ResumePage() {
  const { setRoles, setSessionId } = useRoles()

  return (
    <div className="container-site py-14">
      <div className="max-w-2xl mb-2">
        <span className="eyebrow mb-3">
          <FileText className="h-3.5 w-3.5" />
          Resume Analyzer
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.035em]">Read <span className="gradient-text">your resume</span></h1>
        <p className="mt-3 text-muted-foreground">
          We’ll pull out your skills and matching roles — then carry them into Job Discovery automatically.
        </p>
      </div>

      <div className="mt-8">
        <ResumeAnalyzer
          onAnalyzed={(data) => {
            setRoles(data.roles)
            if (data.session_id) setSessionId(data.session_id)
          }}
        />
      </div>
    </div>
  )
}
