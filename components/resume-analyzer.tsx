'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Upload, FileText, Sparkles, RotateCcw, Zap, Target, TrendingUp, AlertTriangle, ArrowRight, Briefcase, X, Plus, ChevronRight, Lightbulb, Loader2, Copy, Check, Wand2 } from 'lucide-react'
import { APIClient, ResumeResponse, BreakdownDetail } from '@/lib/api'
import { useRoles } from '@/components/roles-provider'
import { cn } from '@/lib/utils'

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB

function validateFile(f: File): string | null {
  const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) return 'Please upload a PDF file.'
  if (f.size > MAX_FILE_BYTES) return 'File is too large. Maximum size is 10MB.'
  if (f.size === 0) return 'That file appears to be empty.'
  return null
}

interface ResumeAnalyzerProps {
  onAnalyzed?: (data: ResumeResponse) => void
}

// Monochrome by default — chips read as neutral "data", not decoration.
const SKILL_CHIP = 'bg-white/[0.05] text-foreground/80 border-white/10'

function CircularProgress({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color = score >= 80 ? 'oklch(0.62 0.16 256)' : score >= 60 ? 'oklch(0.66 0.06 256)' : 'oklch(0.6 0.01 264)'

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} stroke="oklch(0.28 0.005 264)" strokeWidth="8" fill="none" />
        <circle
          cx="72" cy="72" r={radius}
          stroke={color} strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <span className="text-4xl font-bold font-display" style={{ color }}>{score}</span>
        <span className="text-sm text-muted-foreground block -mt-1">/100</span>
      </div>
    </div>
  )
}

function SkeletonResults() {
  return (
    <div className="space-y-6 fade-in">
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
          <div className="w-3 h-3 rounded-full bg-primary/60 spin-slow" />
          Reading your resume…
        </div>
        <p className="text-xs text-muted-foreground mt-2">Pulling out skills and matching roles</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-40 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    </div>
  )
}

const VERDICT_META: Record<string, { label: string; cls: string; bar: string }> = {
  high:   { label: 'Strong',      cls: 'bg-primary/12 text-primary border-primary/25',           bar: 'oklch(0.62 0.2 264)' },
  medium: { label: 'Could be better', cls: 'bg-accent/12 text-accent border-accent/25',          bar: 'oklch(0.64 0.21 300)' },
  low:    { label: 'Needs work',  cls: 'bg-amber-400/12 text-amber-300 border-amber-400/25',      bar: 'oklch(0.78 0.15 70)' },
}

function FixCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600) }}
      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      title="Copy the rewrite"
    >
      {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// Drill-down panel for a single score dimension: why it scored that way, which
// of YOUR resume lines hurt it, and concrete rewrites.
function BreakdownDetailModal({ sessionId, metric, onClose }: { sessionId: string; metric: string; onClose: () => void }) {
  const [detail, setDetail] = useState<BreakdownDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    let alive = true
    setLoading(true); setError(null); setDetail(null)
    APIClient.getBreakdownDetail(sessionId, metric)
      .then((d) => { if (alive) setDetail(d) })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'Failed to load') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [sessionId, metric])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  if (!mounted) return null

  const vm = detail ? (VERDICT_META[detail.verdict] || VERDICT_META.medium) : VERDICT_META.medium

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm fade-in" onClick={onClose} />

      <div className="glass-card gradient-border relative z-10 w-full max-w-2xl rounded-3xl p-6 my-8 fade-in max-h-[88vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="pr-8 mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/25 to-accent/20 border border-primary/25">
              <Wand2 className="h-4 w-4 text-primary" />
            </span>
            <h3 className="font-display text-lg font-semibold leading-tight">{metric}</h3>
          </div>
          {detail && (
            <div className="flex items-center gap-2 mt-2">
              <span className="font-display text-2xl font-bold tabular-nums">{detail.score}<span className="text-sm text-muted-foreground font-normal">/100</span></span>
              <span className={cn('px-2 py-0.5 rounded-full text-[10px] border font-medium', vm.cls)}>{vm.label}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Reading your resume and pinpointing what to fix…
            </div>
            <div className="skeleton h-16 rounded-2xl" />
            <div className="skeleton h-24 rounded-2xl" />
            <div className="skeleton h-24 rounded-2xl" />
          </div>
        ) : error ? (
          <div className="flex gap-2.5 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : detail ? (
          <div className="space-y-5">
            {detail.summary && (
              detail.verdict === 'high' ? (
                <div className="flex items-start gap-2.5 rounded-2xl bg-primary/[0.06] border border-primary/15 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/90 leading-relaxed">{detail.summary}</p>
                </div>
              ) : (
                <p className="text-sm text-foreground/85 leading-relaxed">{detail.summary}</p>
              )
            )}

            {/* Pinpointed line-level fixes */}
            {detail.issues.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Lines holding you back · {detail.issues.length}
                </p>
                {detail.issues.map((issue, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                    {issue.excerpt && (
                      <div className="px-4 py-3 border-l-2 border-destructive/50 bg-destructive/[0.05]">
                        <p className="text-[10px] uppercase tracking-wide text-destructive/80 mb-1">From your resume</p>
                        <p className="text-xs text-foreground/75 font-mono leading-relaxed">“{issue.excerpt}”</p>
                      </div>
                    )}
                    {issue.problem && (
                      <p className="px-4 pt-3 text-xs text-muted-foreground leading-relaxed">{issue.problem}</p>
                    )}
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] uppercase tracking-wide text-primary/90 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Rewrite it as
                        </p>
                        <FixCopyButton text={issue.fix} />
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed rounded-lg bg-primary/[0.06] border border-primary/15 px-3 py-2">
                        {issue.fix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* How to improve — only when the score actually has room to grow */}
            {detail.verdict !== 'high' && detail.tips.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-accent" /> How to lift this score
                </p>
                <ul className="space-y-2">
                  {detail.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!detail.summary && detail.issues.length === 0 && detail.tips.length === 0 && (
              <p className="text-sm text-muted-foreground">This dimension looks solid — nothing specific to fix here.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export function ResumeAnalyzer({ onAnalyzed }: ResumeAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  // Result lives in the shared provider so it survives page navigation.
  const { resume: result, setResume, sessionId } = useRoles()
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  // Which score dimension the user drilled into (opens the detail modal).
  const [activeMetric, setActiveMetric] = useState<string | null>(null)

  // Persist a corrected skills list to the provider AND the backend session, so
  // the match score + cold-email generator use the edited skills too. The backend
  // recomputes the content-aware score/breakdown/suggestions and we apply them.
  const persistSkills = (skills: string[]) => {
    if (!result) return
    const base = result
    setResume({ ...base, skills }) // optimistic
    if (sessionId) {
      APIClient.updateResumeProfile(sessionId, skills, base.roles)
        .then((updated) => setResume({ ...base, ...updated, fileName: base.fileName }))
        .catch(() => {/* non-blocking; optimistic update already applied */})
    }
  }

  const removeSkill = (skill: string) => {
    if (!result) return
    persistSkills(result.skills.filter(s => s !== skill))
  }

  const addSkill = () => {
    const v = newSkill.trim()
    if (!v || !result) return
    if (result.skills.some(s => s.toLowerCase() === v.toLowerCase())) { setNewSkill(''); return }
    persistSkills([...result.skills, v])
    setNewSkill('')
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) {
      const err = validateFile(f)
      if (err) { setError(err); return }
      setFile(f); setError(null)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const err = validateFile(f)
      if (err) { setError(err); setFile(null); return }
      setFile(f); setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const data = await APIClient.uploadResume(file)
      setResume({ ...data, fileName: file.name })
      onAnalyzed?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Real readiness score from the backend (falls back gracefully if absent).
  const score = typeof result?.score === 'number' ? result.score : 0

  if (loading) {
    return <SkeletonResults />
  }

  if (result) {
    return (
      <div className="space-y-5 fade-in">
        {/* Success banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10">
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Analysis complete</p>
            <p className="text-xs text-muted-foreground">Resume processed · {result.fileName ?? file?.name}</p>
          </div>
          <button
            onClick={() => { setResume(null); setFile(null) }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New analysis
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center gap-2">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Resume score</p>
            <CircularProgress score={score} />
            <p className="text-xs text-muted-foreground">
              {score >= 80 ? 'Excellent' : score >= 60 ? 'Looking good' : 'Needs work'}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-1">
            <span className="w-11 h-11 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center mb-1">
              <Zap className="h-5 w-5 text-primary" />
            </span>
            <span className="text-4xl font-bold gradient-text font-display">{result.skills.length}</span>
            <p className="text-xs text-muted-foreground">Skills found</p>
          </div>

          <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-1">
            <span className="w-11 h-11 rounded-xl bg-accent/12 border border-accent/20 flex items-center justify-center mb-1">
              <Target className="h-5 w-5 text-accent" />
            </span>
            <span className="text-4xl font-bold gradient-text font-display">{result.roles.length}</span>
            <p className="text-xs text-muted-foreground">Matching roles</p>
          </div>
        </div>

        {/* Score breakdown — shows WHY the score is what it is */}
        {result.breakdown && Object.keys(result.breakdown).length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Score breakdown</h3>
              <span className="ml-auto text-xs text-muted-foreground">how your {score}/100 is made up</span>
            </div>
            <p className="text-[11px] text-muted-foreground/70 mb-4">Click any metric to see the exact lines hurting it — and how to rewrite them.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(result.breakdown).map(([label, val]) => {
                const v = Math.max(0, Math.min(100, val))
                const barColor = v >= 75 ? 'oklch(0.62 0.2 264)' : v >= 50 ? 'oklch(0.64 0.21 300)' : 'oklch(0.78 0.15 70)'
                return (
                  <button
                    key={label}
                    onClick={() => sessionId && setActiveMetric(label)}
                    disabled={!sessionId}
                    className="group text-left rounded-xl px-2.5 py-2 -mx-1 hover:bg-white/[0.04] transition-colors disabled:cursor-default disabled:hover:bg-transparent"
                    title={sessionId ? `See why “${label}” scored ${v} and how to improve` : undefined}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground/80 flex items-center gap-1">
                        {label}
                        {sessionId && <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">{v}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v}%`, background: barColor }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Skills (editable — correct anything the analyzer got wrong) */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Extracted skills</h3>
            <span className="ml-auto text-xs text-muted-foreground">{result.skills.length} total</span>
          </div>
          <p className="text-[11px] text-muted-foreground/70 mb-4">Tap a skill to remove it, or add ones we missed — your edits are used for matching &amp; emails.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {result.skills.map((skill, i) => (
              <button
                key={skill}
                onClick={() => removeSkill(skill)}
                title="Remove skill"
                className={cn(
                  'group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-[1.03]',
                  SKILL_CHIP,
                  'hover:bg-destructive/15 hover:text-destructive hover:border-destructive/25'
                )}
              >
                {skill}
                <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
            {result.skills.length === 0 && (
              <span className="text-xs text-muted-foreground">No skills detected — add the ones that fit you below.</span>
            )}
          </div>
          <div className="flex gap-2 max-w-sm">
            <input
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill…"
              className="flex-1 bg-white/[0.04] border border-border/40 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-primary/5 transition-all"
            />
            <button
              onClick={addSkill}
              className="px-2.5 py-1.5 rounded-xl bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Roles */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Suggested roles</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.roles.map((role, idx) => (
              <div
                key={role}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group cursor-default"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex-shrink-0">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{role}</p>
                  <p className="text-xs text-muted-foreground">Match #{idx + 1}</p>
                </div>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 border border-primary/15 opacity-0 group-hover:opacity-100 transition-opacity">
                  Suggested
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {(result.strengths && result.strengths.length > 0
                ? result.strengths
                : result.skills.slice(0, 3)
              ).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  {s}
                </li>
              ))}
              {(!result.strengths || result.strengths.length === 0) && result.skills.length === 0 && (
                <li className="text-xs text-muted-foreground">No specific strengths detected yet</li>
              )}
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Areas to improve</h3>
            </div>
            <ul className="space-y-2">
              {(result.suggestions && result.suggestions.length > 0
                ? result.suggestions
                : [
                    'Add quantifiable achievements',
                    'Include a summary section',
                    'Add more relevant keywords',
                  ]
              ).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0 mt-1.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Continue to Job Discovery */}
        <Link
          href="/jobs"
          className="btn-gradient rounded-2xl py-3.5 px-6 text-sm flex items-center justify-center gap-2.5 w-full"
        >
          <Briefcase className="h-4 w-4" />
          Find matching jobs
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-center text-xs text-muted-foreground/50 -mt-2">
          Your {result.roles.length} matched roles will be pre-loaded into Job Discovery
        </p>

        {activeMetric && sessionId && (
          <BreakdownDetailModal
            sessionId={sessionId}
            metric={activeMetric}
            onClose={() => setActiveMetric(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-start py-4 fade-in">
      <div className="w-full max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="badge-pill mb-5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered resume analysis
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 font-display tracking-[-0.035em]">
            Let the genie read <span className="gradient-text">your resume</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Drop in your PDF and get your skills, matching roles, and a quick read on where you stand — in seconds.
          </p>
        </div>

        {/* Upload zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'glass-card gradient-border relative rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer',
            dragActive
              ? 'border-primary/60 bg-primary/5 shadow-[0_0_50px_oklch(0.62_0.2_264/0.3)]'
              : 'hover:border-primary/25'
          )}
        >
          <input
            type="file" accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="file-input"
          />

          {file ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatFileSize(file.size)} · PDF document</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ready to analyze
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300',
                dragActive
                  ? 'bg-primary/20 border-2 border-primary/40 scale-110 glow-ring'
                  : 'bg-primary/10 border-2 border-primary/20 border-dashed'
              )}>
                <Upload className={cn('h-9 w-9 transition-all duration-300', dragActive ? 'text-primary scale-110' : 'text-primary/60')} />
              </div>
              <div>
                <p className="font-semibold text-base">
                  {dragActive ? 'Drop it right here' : 'Drag & drop your resume'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or <span className="text-primary hover:underline">browse files</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground/60">PDF only · up to 10MB</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex gap-2.5 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 fade-in">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-5 w-full btn-gradient rounded-2xl py-3.5 px-6 text-sm flex items-center justify-center gap-2.5 disabled:transform-none disabled:shadow-none"
        >
          <Sparkles className="h-4 w-4" />
          Analyze my resume
        </button>
        <p className="text-center text-xs text-muted-foreground/50 mt-3">
          Usually takes 10–30 seconds, depending on length
        </p>
      </div>
    </div>
  )
}
