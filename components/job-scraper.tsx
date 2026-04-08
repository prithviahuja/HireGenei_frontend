'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { APIClient, Job, JobsRequest } from '@/lib/api'

const WORK_TYPES = ['On-site', 'Hybrid', 'Remote']
const EXP_LEVELS = ['Internship', 'Entry level', 'Associate', 'Mid-senior level']
const TIME_FILTERS = ['Past 24 hours', 'Past week', 'Past month']

interface JobScraperProps {
  defaultRoles?: string[]
}

export function JobScraper({ defaultRoles = [] }: JobScraperProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(defaultRoles)

  useEffect(() => {
    setSelectedRoles(defaultRoles)
  }, [defaultRoles])
  const [cities, setCities] = useState('Delhi,Mumbai,Pune,Chandigarh')
  const [country, setCountry] = useState('India')
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>(['Remote'])
  const [selectedExpLevels, setSelectedExpLevels] = useState<string[]>(['Entry level'])
  const [timeFilter, setTimeFilter] = useState('Past week')
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleWorkTypeChange = (type: string) => {
    setSelectedWorkTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleExpLevelChange = (level: string) => {
    setSelectedExpLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  const handleScrape = async () => {
    if (selectedRoles.length === 0) {
      setError('Please select at least one role')
      return
    }

    setLoading(true)
    setError(null)
    setShowResults(true)

    try {
      const request: JobsRequest = {
        roles: selectedRoles,
        cities,
        country,
        work_types: selectedWorkTypes,
        exp_levels: selectedExpLevels,
        time_filter: timeFilter,
      }

      const response = await APIClient.scrapeJobs(request)
      setJobs(response.jobs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape jobs')
      setShowResults(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Job Scraper</CardTitle>
          <CardDescription>Configure filters and scrape relevant job listings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Roles */}
          <div>
            <label className="text-sm font-semibold block mb-3">Job Roles</label>
            {selectedRoles.length === 0 && defaultRoles.length === 0 ? (
              <p className="text-xs text-muted-foreground mb-3">No roles from resume. Enter roles manually or use recommended ones.</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {defaultRoles.map((role) => (
                <Badge
                  key={role}
                  variant={selectedRoles.includes(role) ? 'default' : 'outline'}
                  className="cursor-pointer py-1"
                  onClick={() => handleRoleChange(role)}
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div>
            <label className="text-sm font-semibold block mb-2">Cities</label>
            <Input
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              placeholder="Enter cities (comma separated)"
              className="bg-background border-border"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-semibold block mb-2">Country</label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Enter country"
              className="bg-background border-border"
            />
          </div>

          {/* Work Types */}
          <div>
            <label className="text-sm font-semibold block mb-3">Work Type</label>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map((type) => (
                <Badge
                  key={type}
                  variant={selectedWorkTypes.includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer py-1"
                  onClick={() => handleWorkTypeChange(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience Levels */}
          <div>
            <label className="text-sm font-semibold block mb-3">Experience Level</label>
            <div className="flex flex-wrap gap-2">
              {EXP_LEVELS.map((level) => (
                <Badge
                  key={level}
                  variant={selectedExpLevels.includes(level) ? 'default' : 'outline'}
                  className="cursor-pointer py-1"
                  onClick={() => handleExpLevelChange(level)}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <label className="text-sm font-semibold block mb-2">Time Filter</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              {TIME_FILTERS.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button onClick={handleScrape} disabled={loading || selectedRoles.length === 0} className="w-full">
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Scraping Jobs...
              </>
            ) : (
              'Start Scraping'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Jobs Found</CardTitle>
                <CardDescription>{jobs.length} positions matching your criteria</CardDescription>
              </div>
              {!loading && jobs.length > 0 && (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No jobs found matching your criteria</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {jobs.map((job, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{job.title}</h4>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">{job.location}</Badge>
                    </div>
                    {job.link && (
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View Job
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
