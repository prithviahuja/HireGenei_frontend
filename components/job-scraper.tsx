'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Briefcase, ExternalLink, MapPin, Clock, Search, SlidersHorizontal, Loader2, X, Plus, Building2 } from 'lucide-react'
import { APIClient, Job, JobsRequest } from '@/lib/api'
import { cn } from '@/lib/utils'

const WORK_TYPES = ['On-site', 'Hybrid', 'Remote']
const EXP_LEVELS = ['Internship', 'Entry level', 'Associate', 'Mid-senior level']
const TIME_FILTERS = ['Past 24 hours', 'Past week', 'Past month']
const DEFAULT_CITIES = ['Delhi', 'Mumbai', 'Pune', 'Chandigarh', 'Bangalore', 'Hyderabad']

const ROLE_ICONS: Record<string, string> = {
  'machine learning': '🤖',
  'data': '📊',
  'frontend': '🎨',
  'backend': '⚙️',
  'devops': '🚀',
  'ai': '✨',
  'full stack': '🔗',
  'product': '📋',
  'design': '🎯',
  'security': '🔒',
}

function getRoleEmoji(role: string) {
  const lower = role.toLowerCase()
  for (const [key, icon] of Object.entries(ROLE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '💼'
}

function JobCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton h-8 w-24 rounded-xl" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center fade-in">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        <Search className="h-9 w-9 text-primary/40" />
      </div>
      <h3 className="font-semibold text-base mb-2">No jobs found yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">Configure your filters and click "Start Scraping" to discover relevant job openings</p>
    </div>
  )
}

function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
        <Briefcase className="h-7 w-7 text-amber-400/60" />
      </div>
      <h3 className="font-semibold text-sm mb-1">No results found</h3>
      <p className="text-xs text-muted-foreground max-w-xs">Try broadening your filters or selecting different job roles</p>
    </div>
  )
}

interface JobScraperProps {
  defaultRoles?: string[]
}

export function JobScraper({ defaultRoles = [] }: JobScraperProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(defaultRoles)
  const [customRole, setCustomRole] = useState('')
  const [cities, setCities] = useState<string[]>(['Delhi', 'Mumbai', 'Pune', 'Chandigarh'])
  const [customCity, setCustomCity] = useState('')
  const [country, setCountry] = useState('India')
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>(['Remote'])
  const [selectedExpLevels, setSelectedExpLevels] = useState<string[]>(['Entry level'])
  const [timeFilter, setTimeFilter] = useState('Past week')
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasScraped, setHasScraped] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => { setSelectedRoles(defaultRoles) }, [defaultRoles])

  const toggle = <T extends string>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]

  const addCustomRole = () => {
    if (customRole.trim() && !selectedRoles.includes(customRole.trim())) {
      setSelectedRoles(prev => [...prev, customRole.trim()])
      setCustomRole('')
    }
  }

  const addCustomCity = () => {
    if (customCity.trim() && !cities.includes(customCity.trim())) {
      setCities(prev => [...prev, customCity.trim()])
      setCustomCity('')
    }
  }

  const handleScrape = async () => {
    if (selectedRoles.length === 0) { setError('Please select at least one role'); return }
    setLoading(true); setError(null); setHasScraped(true); setJobs([]); setProgress(0)

    // Fake progress animation
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 18, 90))
    }, 400)

    try {
      const request: JobsRequest = {
        roles: selectedRoles,
        cities: cities.join(','),
        country,
        work_types: selectedWorkTypes,
        exp_levels: selectedExpLevels,
        time_filter: timeFilter,
      }
      const response = await APIClient.scrapeJobs(request)
      setJobs(response.jobs)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape jobs')
      setHasScraped(false)
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  const ChipButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
        active
          ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_oklch(0.65_0.22_270/0.2)]'
          : 'bg-white/[0.03] text-muted-foreground border-border/40 hover:border-border hover:text-foreground hover:bg-white/5'
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="flex gap-5 h-full fade-in">
      {/* Left: Filters panel */}
      <div className="w-72 flex-shrink-0 space-y-4">
        <div className="glass-card rounded-2xl p-5 space-y-5 sticky top-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Filters</h3>
          </div>

          {/* Roles */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Job Roles</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedRoles.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRoles(prev => prev.filter(r => r !== role))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary/15 text-primary border border-primary/25 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/25 transition-all group"
                >
                  <span>{getRoleEmoji(role)}</span>
                  {role}
                  <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomRole()}
                placeholder="Add role..."
                className="flex-1 bg-white/[0.04] border border-border/40 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-primary/5 transition-all"
              />
              <button
                onClick={addCustomRole}
                className="px-2.5 py-1.5 rounded-xl bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Cities */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Cities</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => setCities(prev => prev.filter(c => c !== city))}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all group"
                >
                  <MapPin className="h-2.5 w-2.5" />
                  {city}
                  <X className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customCity}
                onChange={e => setCustomCity(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomCity()}
                placeholder="Add city..."
                className="flex-1 bg-white/[0.04] border border-border/40 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-all"
              />
              <button onClick={addCustomCity} className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Country</label>
            <input
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full bg-white/[0.04] border border-border/40 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-all"
            />
          </div>

          {/* Work Type */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Work Type</label>
            <div className="flex flex-wrap gap-1.5">
              {WORK_TYPES.map(t => (
                <ChipButton key={t} label={t} active={selectedWorkTypes.includes(t)} onClick={() => setSelectedWorkTypes(prev => toggle(prev, t))} />
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Experience</label>
            <div className="flex flex-wrap gap-1.5">
              {EXP_LEVELS.map(l => (
                <ChipButton key={l} label={l} active={selectedExpLevels.includes(l)} onClick={() => setSelectedExpLevels(prev => toggle(prev, l))} />
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Posted</label>
            <div className="flex flex-col gap-1.5">
              {TIME_FILTERS.map(f => (
                <ChipButton key={f} label={f} active={timeFilter === f} onClick={() => setTimeFilter(f)} />
              ))}
            </div>
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <button
            onClick={handleScrape}
            disabled={loading || selectedRoles.length === 0}
            className="w-full btn-gradient rounded-2xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Start Scraping
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-muted-foreground/40">
            ⏱ Scraping may take 15–60 seconds
          </p>
        </div>
      </div>

      {/* Right: Results panel */}
      <div className="flex-1 min-w-0">
        {/* Results header */}
        {hasScraped && (
          <div className="mb-4 fade-in">
            {loading ? (
              <div className="glass-card rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    Scraping job listings...
                  </div>
                  <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, oklch(0.58 0.24 270), oklch(0.72 0.18 190))'
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Searching across {selectedRoles.length} roles in {cities.length} cities...</p>
              </div>
            ) : (
              <div className="flex items-center justify-between px-1">
                <p className="text-sm font-semibold">
                  <span className="gradient-text">{jobs.length}</span>
                  <span className="text-muted-foreground ml-1.5 font-normal">positions found</span>
                </p>
                <p className="text-xs text-muted-foreground">{selectedRoles.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Job cards */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : !hasScraped ? (
          <EmptyState />
        ) : jobs.length === 0 ? (
          <NoResults />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {jobs.map((job, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-5 hover:border-primary/25 hover:shadow-[0_0_20px_oklch(0.65_0.22_270/0.1)] transition-all duration-200 group fade-in flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* Company logo placeholder */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/40 flex items-center justify-center flex-shrink-0 text-lg">
                    {getRoleEmoji(job.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">{job.title}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">{job.company}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {job.location && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      <MapPin className="h-2.5 w-2.5" />
                      {job.location}
                    </span>
                  )}
                  {selectedWorkTypes[0] && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {selectedWorkTypes[0]}
                    </span>
                  )}
                  {selectedExpLevels[0] && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {selectedExpLevels[0]}
                    </span>
                  )}
                </div>

                {/* Apply button */}
                {job.link && (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 hover:shadow-[0_0_12px_oklch(0.65_0.22_270/0.3)] transition-all w-fit"
                  >
                    Apply Now
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
