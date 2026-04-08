'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react'
import { APIClient, ResumeResponse } from '@/lib/api'

interface ResumeAnalyzerProps {
  onAnalyzed?: (data: ResumeResponse) => void
}

export function ResumeAnalyzer({ onAnalyzed }: ResumeAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResumeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      setFile(files[0])
      setError(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
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

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Resume Analyzer</CardTitle>
          <CardDescription>Upload your resume to extract skills and find matching job roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result ? (
            <>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drag and drop your PDF resume here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <div className="mt-4">
                    {file && <p className="text-sm text-foreground font-medium">{file.name}</p>}
                  </div>
                </label>
              </div>

              {error && (
                <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Resume analyzed successfully</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-3">Extracted Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-3">Matching Job Roles</h3>
                <div className="space-y-2">
                  {result.roles.map((role, idx) => (
                    <div key={role} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded w-fit">
                        #{idx + 1}
                      </span>
                      <p className="text-sm font-medium flex-1">{role}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setResult(null)
                  setFile(null)
                }}
                className="w-full"
              >
                Upload Another Resume
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
