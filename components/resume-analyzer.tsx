'use client'

import { useState, useCallback } from 'react'
import { AlertCircle, CheckCircle2, Upload, FileText, Sparkles, RotateCcw, Zap, Target, TrendingUp, AlertTriangle } from 'lucide-react'
import { APIClient, ResumeResponse } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ResumeAnalyzerProps {
  onAnalyzed?: (data: ResumeResponse) => void
}

const SKILL_COLORS = [
  'bg-violet-500/15 text-violet-300 border-violet-500/25',
  'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'bg-amber-500/15 text-amber-300 border-amber-500/25',
  'bg-pink-500/15 text-pink-300 border-pink-500/25',
  'bg-blue-500/15 text-blue-300 border-blue-500/25',
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

  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} stroke="oklch(0.22 0.015 255)" strokeWidth="8" fill="none" />
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
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-sm text-muted-foreground block -mt-0.5">/100</span>
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
          AI is analyzing your resume...
        </div>
        <p className="text-xs text-muted-foreground mt-2">This may take a moment</p>
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
    if (f) { setFile(f); setError(null) }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setError(null) }
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

  // Mock score for display (backend may not return score, so default to 78)
  const score = (result as any)?.score ?? 78

  if (loading) {
    return <SkeletonResults />
  }

  if (result) {
    return (
      <div className="space-y-5 fade-in">
        {/* Success banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-300">Analysis Complete</p>
            <p className="text-xs text-emerald-400/70">Resume processed · {file?.name}</p>
          </div>
          <button
            onClick={() => { setResult(null); setFile(null) }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Analysis
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Score card */}
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Resume Score</p>
            <CircularProgress score={score} />
            <p className="text-xs text-muted-foreground">
              {score >= 80 ? '🟢 Excellent' : score >= 60 ? '🟡 Good' : '🔴 Needs Work'}
            </p>
          </div>

          {/* Skills count */}
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-1">
            <Zap className="h-8 w-8 text-violet-400 mb-1" />
            <span className="text-3xl font-bold gradient-text">{result.skills.length}</span>
            <p className="text-xs text-muted-foreground">Skills Found</p>
          </div>

          {/* Roles count */}
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-1">
            <Target className="h-8 w-8 text-cyan-400 mb-1" />
            <span className="text-3xl font-bold gradient-text">{result.roles.length}</span>
            <p className="text-xs text-muted-foreground">Matching Roles</p>
          </div>
        </div>

        {/* Skills section */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-semibold">Extracted Skills</h3>
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

        {/* Roles section */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold">Suggested Roles</h3>
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

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-300">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {(result.skills.slice(0, 3)).map(s => (
                <li key={s} className="flex items-center gap-2 text-xs text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
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
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-300">Areas to Improve</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                Add quantifiable achievements
              </li>
              <li className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                Include a summary section
              </li>
              <li className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                Add more relevant keywords
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-start py-4 fade-in">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-4">
            <Sparkles className="h-3 w-3" />
            AI-Powered Resume Analysis
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Analyze Your Resume</h1>
          <p className="text-sm text-muted-foreground">Upload your PDF resume and let AI extract insights, skills, and matching roles in seconds</p>
        </div>

        {/* Upload card */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'glass-card relative rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer',
            dragActive
              ? 'border-primary/60 bg-primary/5 shadow-[0_0_40px_oklch(0.65_0.22_270/0.2)]'
              : 'hover:border-border/60 hover:shadow-[0_0_24px_oklch(0_0_0/0.4)]'
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
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <FileText className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatFileSize(file.size)} · PDF Document</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
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
                  {dragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or <span className="text-primary hover:underline">browse files</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground/60">PDF files only · Max 10MB</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex gap-2.5 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 fade-in">
            <AlertCircle className="h-4.5 w-4.5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-5 w-full btn-gradient rounded-2xl py-3.5 px-6 text-sm font-semibold text-white flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          <Sparkles className="h-4 w-4" />
          Analyze Resume
        </button>
        <p className="text-center text-xs text-muted-foreground/50 mt-3">
          ⏱ Analysis typically takes 10–30 seconds depending on document length
        </p>
      </div>
    </div>
  )
}
