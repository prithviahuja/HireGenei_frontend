'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  X, ExternalLink, Building2, MapPin, Loader2, Mail, Phone, Copy, Check,
  Sparkles, Target, AlertCircle, Send, FileText, ShieldQuestion,
} from 'lucide-react'
import { APIClient, Job, MatchResult, ContactInfo, EmailDraft } from '@/lib/api'
import { useRoles } from '@/components/roles-provider'
import { cn } from '@/lib/utils'

// Backend phrases that mean "this session no longer has a usable resume" —
// i.e. the stored session_id is stale (e.g. the backend restarted and wiped its
// in-memory sessions). When we see one of these we clear the cached resume so
// the whole app stops pretending a resume is loaded.
const STALE_SESSION_RE = /upload your resume first|re-?upload your resume|session not found/i

interface JobMatchModalProps {
  job: Job
  sessionId: string | null
  onClose: () => void
}

function ScoreRing({ score }: { score: number }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? 'oklch(0.62 0.16 256)' : score >= 50 ? 'oklch(0.66 0.06 256)' : 'oklch(0.6 0.01 264)'
  return (
    <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
      <svg className="absolute" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} stroke="oklch(0.28 0.005 264)" strokeWidth="7" fill="none" />
        <circle
          cx="48" cy="48" r={radius} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <span className="text-2xl font-bold font-display" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground block -mt-1">/100</span>
      </div>
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* ignore */ }
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all"
    >
      {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : (label || 'Copy')}
    </button>
  )
}

const confidenceStyle: Record<string, string> = {
  high: 'bg-primary/12 text-primary border-primary/25',
  medium: 'bg-white/[0.05] text-foreground/80 border-white/10',
  low: 'bg-white/[0.04] text-muted-foreground border-white/10',
  none: 'bg-white/[0.04] text-muted-foreground border-border/40',
}

// Seniority-fit chip: label + tint for each verdict the matcher can return.
const seniorityFitStyle: Record<string, string> = {
  'good fit': 'bg-primary/12 text-primary border-primary/25',
  'under-qualified': 'bg-white/[0.05] text-foreground/80 border-white/10',
  'over-qualified': 'bg-white/[0.05] text-foreground/80 border-white/10',
}

export function JobMatchModal({ job, sessionId, onClose }: JobMatchModalProps) {
  // Lets us purge a stale resume/session from the whole app if the backend
  // reports it no longer has our resume. emailTemplate is the optional custom
  // draft the user entered on the jobs page — passed through so the backend
  // personalizes it for this job instead of auto-writing from scratch.
  const { setResume, setSessionId, emailTemplate } = useRoles()
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [email, setEmail] = useState<EmailDraft | null>(null)
  const [stage, setStage] = useState<'scoring' | 'contacts' | 'drafting' | 'done'>('scoring')
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Editable draft fields
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [recipient, setRecipient] = useState('')

  const abortRef = useRef<AbortController | null>(null)

  const runMatch = useCallback(() => {
    if (!sessionId) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setError(null); setMatch(null); setContact(null); setEmail(null); setStage('scoring')

    APIClient.matchJobStream(
      { session_id: sessionId, title: job.title, company: job.company, location: job.location, link: job.link, email_template: emailTemplate || undefined },
      {
        signal: controller.signal,
        onScore: (m) => { setMatch(m); setStage('contacts') },
        onContact: (c) => { setContact(c); setStage('drafting'); if (c.emails?.[0]) setRecipient(c.emails[0]) },
        onEmail: (e) => {
          setEmail(e); setSubject(e.subject || ''); setBody(e.body || '')
          if (e.to) setRecipient(e.to)
          setStage('done')
        },
        onDone: () => setStage('done'),
        onError: (msg) => {
          // Stale/expired session: the cached score was misleading. Wipe it so
          // the modal falls back to the "upload your resume first" gate and the
          // Resume page no longer shows a phantom analysis. (Roles are kept —
          // job search doesn't need a session.)
          if (STALE_SESSION_RE.test(msg)) {
            setResume(null)
            setSessionId(null)
          } else {
            setError(msg)
          }
        },
      }
    )
  }, [sessionId, job, setResume, setSessionId, emailTemplate])

  useEffect(() => { runMatch() }, [runMatch])

  // Portal target is only available on the client.
  useEffect(() => { setMounted(true) }, [])

  // Esc to close (depends on onClose).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock background scroll + abort the in-flight request ONLY on real unmount.
  // Kept OUT of the [onClose] effect on purpose: the background job scrape can
  // still be streaming, which re-renders the parent and changes onClose's
  // identity — if the abort lived here it would kill our match request
  // mid-flight (e.g. during email generation), leaving the modal stuck.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      abortRef.current?.abort()
    }
  }, [])

  const mailtoHref = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  if (!mounted) return null

  // Portal to <body> so the modal's fixed positioning is relative to the
  // viewport — NOT to an ancestor that has a lingering CSS transform (the
  // `fade-in` animation leaves `transform: translateY(0)`, which would
  // otherwise trap this overlay inside the content column).
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm fade-in" onClick={onClose} />

      {/* Panel */}
      <div className="glass-card relative z-10 w-full max-w-2xl rounded-3xl p-6 my-8 fade-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="pr-8 mb-5">
          <h3 className="font-semibold text-lg leading-tight font-display">{job.title}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.company}</span>
            {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
          </div>
        </div>

        {/* No-resume gate */}
        {!sessionId ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary/60" />
            </div>
            <div>
              <p className="text-sm font-semibold">Upload your resume first</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                We need your resume to score this match and draft a tailored email.
              </p>
            </div>
            <Link href="/resume" className="btn-gradient rounded-xl px-5 py-2.5 text-sm inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Analyze my resume
            </Link>
            <div className="pt-2">
              <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
                View original post <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4 py-4">
            <div className="flex gap-2.5 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={runMatch} className="btn-gradient rounded-xl px-4 py-2 text-sm flex-1">Try again</button>
              <a href={job.link} target="_blank" rel="noopener noreferrer" className="rounded-xl px-4 py-2 text-sm border border-border/50 text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5">
                View original post <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ---- Match score ---- */}
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
              {match ? <ScoreRing score={match.score} /> : (
                <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume match</span>
                </div>
                {match ? (
                  <>
                    <p className="text-sm font-medium">{match.summary}</p>
                    {match.seniority_fit && match.seniority_fit !== 'unknown' && (
                      <span className={cn('inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] border capitalize', seniorityFitStyle[match.seniority_fit] || confidenceStyle.none)}>
                        Seniority: {match.seniority_fit}
                      </span>
                    )}
                    {match.matched_skills.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">You have</p>
                        <div className="flex flex-wrap gap-1">
                          {match.matched_skills.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {match.missing_skills.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Mentioned in JD, not on resume</p>
                        <div className="flex flex-wrap gap-1">
                          {match.missing_skills.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.05] text-foreground/70 border border-white/10">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Reading the job description and scoring your fit…</p>
                )}
              </div>
            </div>

            {/* ---- Two actions ---- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={job.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-border/50 bg-white/[0.03] px-4 py-3 text-sm font-medium hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <ExternalLink className="h-4 w-4 text-primary" />
                View original post
              </a>
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
                <Mail className="h-4 w-4" />
                Tailored email below
              </div>
            </div>

            {/* ---- Contact info ---- */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company contact</span>
                {contact && contact.source !== 'none' && (
                  <span className={cn('ml-auto px-2 py-0.5 rounded-full text-[10px] border', confidenceStyle[contact.confidence] || confidenceStyle.none)}>
                    {contact.confidence} confidence · {contact.source}
                  </span>
                )}
              </div>
              {!contact ? (
                <p className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching the job post & web…</p>
              ) : (contact.emails.length === 0 && contact.phones.length === 0) ? (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldQuestion className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>No public email or phone found. You can still send via the company&apos;s LinkedIn page, or add a recipient manually below.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {contact.emails.map(e => (
                    <div key={e} className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate flex-1">{e}</span>
                      <button onClick={() => setRecipient(e)} className="text-[11px] text-primary hover:underline">Use</button>
                      <CopyButton text={e} />
                    </div>
                  ))}
                  {contact.phones.map(p => (
                    <div key={p} className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate flex-1">{p}</span>
                      <CopyButton text={p} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ---- Email draft ---- */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tailored email</span>
              </div>

              {!email ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {stage === 'drafting' ? 'Writing a draft from your projects & experience…' : 'Preparing…'}
                  </p>
                  <div className="skeleton h-8 rounded-xl" />
                  <div className="skeleton h-32 rounded-xl" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">To</label>
                    <input
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      placeholder="recipient@company.com"
                      className="w-full bg-white/[0.04] border border-border/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Subject</label>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full bg-white/[0.04] border border-border/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Message</label>
                    <textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      rows={12}
                      className="w-full bg-white/[0.04] border border-border/40 rounded-xl px-3 py-2 text-sm leading-relaxed focus:outline-none focus:border-primary/40 transition-all resize-y font-sans"
                    />
                  </div>

                  <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    Review before sending — attach your resume in your mail client. Auto-found contacts may be inaccurate.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <CopyButton text={`Subject: ${subject}\n\n${body}`} label="Copy email" />
                    <a
                      href={gmailHref} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all"
                    >
                      <Send className="h-3.5 w-3.5" /> Open in Gmail
                    </a>
                    <a
                      href={mailtoHref}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] border border-border/40 text-foreground hover:border-border transition-all"
                    >
                      <Mail className="h-3.5 w-3.5" /> Open in mail app
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
