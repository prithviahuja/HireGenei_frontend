'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Upload, FileText, Sparkles, RotateCcw, Zap, Target, TrendingUp, AlertTriangle, ArrowRight, Briefcase } from 'lucide-react'
import { APIClient, ResumeResponse } from '@/lib/api'
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

const SKILL_COLORS = [
  'bg-primary/12 text-primary border-primary/25',
  'bg-accent/12 text-accent border-accent/25',
  'bg-emerald-400/12 text-emerald-300 border-emerald-400/25',
  'bg-amber-400/12 text-amber-300 border-amber-400/25',
  'bg-rose-400/12 text-rose-300 border-rose-400/25',
  'bg-sky-400/12 text-sky-300 border-sky-400/25',
]

const ROLE_ICONS: Record<string, string> = {
  default: '💼',
  'machine learning': '🤖',
  'data scientist': '📊',
  'software engineer': '⚙️',
  'frontend': '🎨',
  'backend': '🔧',
  'devops': '🚀',
  'product manager': '📋',
  'ai': '✨',
  'analyst': '📈',
}

function getRoleIcon(role: string) {
  const lower = role.toLowerCase()
  for (const [key, icon] of Object.entries(ROLE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return ROLE_ICONS.default
}

function CircularProgress({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color = score >= 80 ? 'oklch(0.72 0.16 162)' : score >= 60 ? 'oklch(0.85 0.18 124)' : 'oklch(0.65 0.18 24)'

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} stroke="oklch(0.26 0.012 70)" strokeWidth="8" fill="none" />
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

export function ResumeAnalyzer({ onAnalyzed }: ResumeAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResumeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

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
      setResult(data)
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
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-400/8 border border-emerald-400/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-300 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-200">Analysis complete</p>
            <p className="text-xs text-emerald-300/70">Resume processed · {file?.name}</p>
          </div>
          <button
            onClick={() => { setResult(null); setFile(null) }}
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

        {/* Skills */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Extracted skills</h3>
            <span className="ml-auto text-xs text-muted-foreground">{result.skills.length} total</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.skills.map((skill, i) => (
              <span
                key={skill}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-transform hover:scale-105 cursor-default',
                  SKILL_COLORS[i % SKILL_COLORS.length]
                )}
              >
                {skill}
              </span>
            ))}
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
                <span className="text-2xl">{getRoleIcon(role)}</span>
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
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              <h3 className="text-sm font-semibold text-emerald-200">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {(result.skills.slice(0, 3)).map(s => (
                <li key={s} className="flex items-center gap-2 text-xs text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
                  {s}
                </li>
              ))}
              {result.skills.length === 0 && (
                <li className="text-xs text-muted-foreground">No specific strengths detected</li>
              )}
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              <h3 className="text-sm font-semibold text-amber-200">Areas to improve</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 flex-shrink-0" />
                Add quantifiable achievements
              </li>
              <li className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 flex-shrink-0" />
                Include a summary section
              </li>
              <li className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 flex-shrink-0" />
                Add more relevant keywords
              </li>
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
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-start py-4 fade-in">
      <div className="w-full max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-5">
            <Sparkles className="h-3 w-3" />
            AI-powered resume analysis
          </div>
          <h1 className="text-4xl font-bold mb-3 font-display tracking-tight">
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
            'glass-card relative rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer',
            dragActive
              ? 'border-primary/60 bg-primary/5 shadow-[0_0_44px_oklch(0.72_0.16_162/0.22)]'
              : 'hover:shadow-[0_0_28px_oklch(0_0_0/0.4)]'
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
              <div className="w-16 h-16 rounded-2xl bg-emerald-400/12 border border-emerald-400/25 flex items-center justify-center">
                <FileText className="h-8 w-8 text-emerald-300" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatFileSize(file.size)} · PDF document</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-xs text-emerald-300">
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
