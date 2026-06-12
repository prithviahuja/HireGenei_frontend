'use client'

import { JobScraper } from '@/components/job-scraper'
import { useRoles } from '@/components/roles-provider'
import { Briefcase } from 'lucide-react'

export default function JobsPage() {
  const { roles } = useRoles()

  return (
    <div className="container-site py-14">
      <div className="max-w-2xl mb-8">
        <span className="eyebrow mb-3">
          <Briefcase className="h-3.5 w-3.5" />
          Job Discovery
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight">Discover matching jobs</h1>
        <p className="mt-3 text-muted-foreground">
          {roles.length > 0
            ? 'Your roles from the resume analyzer are pre-loaded. Tune the filters and start scraping.'
            : 'Pick your roles, cities, and filters, then start scraping live listings.'}
        </p>
      </div>

      <div className="min-h-[70vh]">
        <JobScraper defaultRoles={roles} />
      </div>
    </div>
  )
}
