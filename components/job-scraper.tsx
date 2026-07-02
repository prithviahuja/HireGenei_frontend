'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { AlertCircle, Briefcase, ExternalLink, MapPin, Search, SlidersHorizontal, Loader2, X, Plus, Building2, MessageSquare, ArrowRight, CheckCircle2, Mail, Target, PencilLine, ChevronDown, Check } from 'lucide-react'
import { APIClient, Job, JobsRequest } from '@/lib/api'
import { useRoles } from '@/components/roles-provider'
import { JobMatchModal } from '@/components/job-match-modal'
import { cn } from '@/lib/utils'

const WORK_TYPES = ['On-site', 'Hybrid', 'Remote']
const EXP_LEVELS = ['Internship', 'Entry level', 'Associate', 'Mid-senior level']
const TIME_FILTERS = ['Past 24 hours', 'Past week', 'Past month']
// Job-board engines. 'linkedin' = live LinkedIn scrape; 'jsearch' = aggregated
// Indeed / Naukri / foundit / LinkedIn via the JSearch API (active only when the
// backend has a RapidAPI key configured).
const SOURCES: { id: string; label: string }[] = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'jsearch', label: 'Indeed, Naukri & more' },
]

// Single neutral source badge — the label tells you the board; no need for a
// different colour per source in a monochrome UI.
function sourceBadgeClass(_source?: string) {
  return 'bg-white/[0.05] text-muted-foreground border-white/10'
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
        <Search className="h-9 w-9 text-primary/45" />
      </div>
      <h3 className="font-semibold text-base mb-2 font-display">Ready when you are</h3>
      <p className="text-sm text-muted-foreground max-w-xs">Set your filters on the left and hit “Start scraping” to surface fresh openings.</p>
    </div>
  )
}

function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
      <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
        <Briefcase className="h-7 w-7 text-muted-foreground/70" />
      </div>
      <h3 className="font-semibold text-sm mb-1">Nothing matched</h3>
      <p className="text-xs text-muted-foreground max-w-xs">Try widening your filters or picking different roles.</p>
    </div>
  )
}

// Optional custom email draft. When the user writes one here, it becomes the
// base for every job's tailored email (the AI personalizes it per company/role
// instead of writing one from scratch). Left empty => the default auto-writer.
function EmailDraftPanel({ value, onSave }: { value: string; onSave: (t: string) => void }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [justSaved, setJustSaved] = useState(false)

  // Keep the local editor in sync if the stored template changes elsewhere.
  useEffect(() => { setDraft(value) }, [value])

  const save = () => {
    onSave(draft.trim())
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1600)
  }
  const clear = () => { setDraft(''); onSave('') }

  const hasTemplate = value.trim().length > 0

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/12 border border-primary/20 flex-shrink-0">
          <PencilLine className="h-4 w-4 text-primary" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold">Your email draft</span>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[10px] border',
              hasTemplate
                ? 'bg-primary/12 text-primary border-primary/25'
                : 'bg-white/[0.04] text-muted-foreground border-border/40'
            )}>
              {hasTemplate ? 'Custom draft active' : 'Optional'}
            </span>
          </span>
          <span className="block text-xs text-muted-foreground mt-0.5">
            {hasTemplate
              ? 'Each job email is personalized from your draft.'
              : 'Add your own template, or leave empty to auto-write each email.'}
          </span>
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 fade-in">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={8}
            placeholder={
              "Write your base email here. The AI will tailor it to each job's role & company while keeping your tone and structure.\n\n" +
              "Tip: you can use placeholders like [Role], [Company], or [Hiring Manager] — they'll be filled in per job."
            }
            className="w-full bg-white/[0.04] border border-border/40 rounded-xl px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:border-primary/40 focus:bg-primary/5 transition-all resize-y font-sans placeholder:text-muted-foreground/50"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={save}
              className="btn-gradient rounded-xl px-4 py-2 text-xs flex items-center gap-1.5"
            >
              {justSaved ? <Check className="h-3.5 w-3.5" /> : <PencilLine className="h-3.5 w-3.5" />}
              {justSaved ? 'Saved' : 'Save draft'}
            </button>
            {(draft.trim() || hasTemplate) && (
              <button
                onClick={clear}
                className="rounded-xl px-4 py-2 text-xs border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all"
              >
                Clear
              </button>
            )}
            <span className="text-[10px] text-muted-foreground/60">
              Saved for this session — applies to every job you open.
            </span>
          </div>
        </div>
      )}
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
  const [selectedSources, setSelectedSources] = useState<string[]>(['linkedin', 'jsearch'])
  const [loading, setLoading] = useState(false)
  // Jobs live in the shared provider so they survive page navigation.
  const { sessionId, jobs, setJobs, emailTemplate, setEmailTemplate } = useRoles()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [hasScraped, setHasScraped] = useState(jobs.length > 0)
  const [finished, setFinished] = useState(jobs.length > 0)
  const [activeJob, setActiveJob] = useState<Job | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // Stable so the modal's effects don't churn when the background scrape re-renders us.
  const closeModal = useCallback(() => setActiveJob(null), [])

  useEffect(() => { setSelectedRoles(defaultRoles) }, [defaultRoles])

  // Cancel any in-flight stream when leaving the page
  useEffect(() => () => abortRef.current?.abort(), [])

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
    if (selectedRoles.length === 0) { setError('Pick at least one role to search'); return }
    if (selectedSources.length === 0) { setError('Pick at least one source to search'); return }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true); setError(null); setNotice(null); setHasScraped(true); setFinished(false); setJobs([])

    const request: JobsRequest = {
      roles: selectedRoles,
      cities: cities.join(','),
      country,
      work_types: selectedWorkTypes,
      exp_levels: selectedExpLevels,
      time_filter: timeFilter,
      sources: selectedSources,
    }

    await APIClient.scrapeJobsStream(request, {
      signal: controller.signal,
      // Each job is appended the instant it arrives — results show up live.
      onJob: (job) => setJobs((prev) => [...prev, job]),
      onWarning: (msg) => setNotice(msg),
      onError: (msg) => { setError(msg); setLoading(false) },
      onDone: () => { setLoading(false); setFinished(true) },
    })
  }

  const ChipButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
        active
          ? 'bg-primary/18 text-primary border-primary/35'
          : 'bg-white/[0.03] text-muted-foreground border-border/40 hover:border-border hover:text-foreground hover:bg-white/[0.05]'
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="flex gap-5 h-full fade-in">
      {/* Filters */}
      <div className="w-72 flex-shrink-0 space-y-4">
        <div className="glass-card rounded-2xl p-5 space-y-5 sticky top-20">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold font-display">Filters</h3>
          </div>

          {/* Roles */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Job roles</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedRoles.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRoles(prev => prev.filter(r => r !== role))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary/15 text-primary border border-primary/25 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/25 transition-all group"
                >
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
                placeholder="Add role…"
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
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Cities</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => setCities(prev => prev.filter(c => c !== city))}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all group"
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
                placeholder="Add city…"
                className="flex-1 bg-white/[0.04] border border-border/40 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/40 transition-all"
              />
              <button onClick={addCustomCity} className="px-2.5 py-1.5 rounded-xl bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Country</label>
            <input
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full bg-white/[0.04] border border-border/40 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-all"
            />
          </div>

          {/* Work type */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Work type</label>
            <div className="flex flex-wrap gap-1.5">
              {WORK_TYPES.map(t => (
                <ChipButton key={t} label={t} active={selectedWorkTypes.includes(t)} onClick={() => setSelectedWorkTypes(prev => toggle(prev, t))} />
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Experience</label>
            <div className="flex flex-wrap gap-1.5">
              {EXP_LEVELS.map(l => (
                <ChipButton key={l} label={l} active={selectedExpLevels.includes(l)} onClick={() => setSelectedExpLevels(prev => toggle(prev, l))} />
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Posted</label>
            <div className="flex flex-col gap-1.5">
              {TIME_FILTERS.map(f => (
                <ChipButton key={f} label={f} active={timeFilter === f} onClick={() => setTimeFilter(f)} />
              ))}
            </div>
          </div>

          {/* Sources */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Sources</label>
            <div className="flex flex-wrap gap-1.5">
              {SOURCES.map(s => (
                <ChipButton
                  key={s.id}
                  label={s.label}
                  active={selectedSources.includes(s.id)}
                  onClick={() => setSelectedSources(prev => toggle(prev, s.id))}
                />
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
            className="w-full btn-gradient rounded-2xl py-3 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scraping…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Start scraping
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-muted-foreground/40">
            Scraping can take 15–60 seconds
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 min-w-0">
        {hasScraped && (
          <div className="mb-4 fade-in space-y-3">
            {/* Optional custom email draft — applies to every job email below. */}
            <EmailDraftPanel value={emailTemplate} onSave={setEmailTemplate} />

            {loading ? (
              <div className="glass-card rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    Searching job boards…
                  </div>
                  <span className="text-xs font-medium">
                    <span className="gradient-text font-display">{jobs.length}</span>
                    <span className="text-muted-foreground ml-1">found so far</span>
                  </span>
                </div>
                {/* Indeterminate live bar — results stream in as they're found */}
                <div className="h-1.5 rounded-full bg-border/50 overflow-hidden relative">
                  <div
                    className="h-full w-1/3 rounded-full absolute"
                    style={{
                      background: 'oklch(0.62 0.16 256)',
                      animation: 'jobsweep 1.3s ease-in-out infinite',
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Live results across {selectedRoles.length} {selectedRoles.length === 1 ? 'role' : 'roles'} in {cities.length} {cities.length === 1 ? 'city' : 'cities'} — they appear below as we find them.
                </p>
                <style>{`@keyframes jobsweep{0%{left:-35%}100%{left:100%}}`}</style>
              </div>
            ) : (
              <div className="px-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    <span className="gradient-text font-display text-base">{jobs.length}</span>
                    <span className="text-muted-foreground ml-1.5 font-normal">positions found</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[50%]">{selectedRoles.join(', ')}</p>
                </div>
                {/* Honest, search-wide view of the active filters (these are applied
                    to the LinkedIn query — not faked onto each card). */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Filters:</span>
                  {[...selectedWorkTypes, ...selectedExpLevels, timeFilter].map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.04] text-muted-foreground border border-border/40">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {notice && (
              <div className="flex gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{notice}</p>
              </div>
            )}
          </div>
        )}

        {!hasScraped ? (
          <EmptyState />
        ) : jobs.length === 0 && loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <NoResults />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {jobs.map((job, idx) => (
              <div
                key={job.link || idx}
                onClick={() => setActiveJob(job)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveJob(job) } }}
                className="card-spotlight glass-card gradient-border rounded-2xl p-5 transition-all duration-200 group fade-in flex flex-col gap-3 cursor-pointer focus:outline-none focus:border-primary/40"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/22 to-accent/18 border border-primary/25 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">{job.title}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">{job.company}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {job.source && (
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] border font-medium', sourceBadgeClass(job.source))}>
                      {job.source}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent border border-accent/20">
                      <MapPin className="h-2.5 w-2.5" />
                      {job.location}
                    </span>
                  )}
                  {/* Note: LinkedIn job cards don't expose per-job work-type or
                      experience level, so we don't badge them here — those are
                      applied as search filters (shown once in the header). */}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-primary/15 text-primary border border-primary/20 group-hover:bg-primary/25 transition-all">
                    <Target className="h-3 w-3" />
                    Match &amp; email
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                    <Mail className="h-3 w-3" />
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
              ))}
              {/* keep streaming feedback inline while more arrive */}
              {loading && Array.from({ length: 2 }).map((_, i) => <JobCardSkeleton key={`s${i}`} />)}
            </div>

            {/* Continue to the AI consultant once scraping completes */}
            {finished && jobs.length > 0 && (
              <div className="mt-6 glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 fade-in">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/12 border border-primary/20 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </span>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm font-semibold">Found {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} for you</p>
                  <p className="text-xs text-muted-foreground">Not sure which to apply for? Ask the AI consultant for tailored advice.</p>
                </div>
                <Link
                  href="/consultant"
                  className="btn-gradient rounded-xl px-5 py-2.5 text-sm flex items-center gap-2 flex-shrink-0"
                >
                  <MessageSquare className="h-4 w-4" />
                  Talk to the consultant
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {activeJob && (
        <JobMatchModal job={activeJob} sessionId={sessionId} onClose={closeModal} />
      )}
    </div>
  )
}
