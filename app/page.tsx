import Link from 'next/link'
import { FileText, Briefcase, MessageSquare, Sparkles, ArrowRight, Upload, Target, Zap } from 'lucide-react'

const TOOLS = [
  {
    href: '/resume',
    icon: FileText,
    title: 'Resume Analyzer',
    desc: 'Upload your PDF and instantly see the skills you carry and the roles you fit.',
    cta: 'Analyze resume',
  },
  {
    href: '/jobs',
    icon: Briefcase,
    title: 'Job Discovery',
    desc: 'Pull live listings filtered by role, city, work type, and experience level.',
    cta: 'Find jobs',
  },
  {
    href: '/consultant',
    icon: MessageSquare,
    title: 'AI Consultant',
    desc: 'Chat with a career coach for resume feedback, skill gaps, and salary strategy.',
    cta: 'Start chatting',
  },
]

const STEPS = [
  { n: '01', icon: Upload, title: 'Upload your resume', desc: 'Drop in a PDF. The genie reads it and pulls out your skills and best-fit roles.' },
  { n: '02', icon: Target, title: 'Discover matching jobs', desc: 'Your roles flow straight into Job Discovery — filter and surface live openings.' },
  { n: '03', icon: Zap, title: 'Get coached, then apply', desc: 'Ask the AI consultant anything, sharpen your pitch, and apply with confidence.' },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero-glow">
        <div className="container-site grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-28">
          <div className="fade-in">
            <span className="eyebrow mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              AI career platform
            </span>
            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Find your next role
              <br />
              with a little <span className="gradient-text">magic.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              HireGenei reads your resume, surfaces jobs that actually fit, and coaches you through the
              search — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/resume" className="btn-gradient rounded-xl px-6 py-3 text-sm flex items-center gap-2">
                Analyze my resume
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/consultant" className="btn-outline rounded-xl px-6 py-3 text-sm font-medium">
                Ask the genie
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted-foreground/60">
              No sign-up needed · PDF resumes · results in seconds
            </p>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="glass-card rounded-3xl p-7 float-y">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Resume score</p>
                  <p className="font-display text-2xl font-bold mt-1">Looking good</p>
                </div>
                <div className="relative w-20 h-20">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" stroke="oklch(0.26 0.012 70)" strokeWidth="6" fill="none" />
                    <circle
                      cx="40" cy="40" r="32"
                      stroke="oklch(0.72 0.16 162)" strokeWidth="6" fill="none" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - 0.82)}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-primary">82</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Top skills detected</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {['Python', 'Machine Learning', 'SQL', 'React', 'Data Analysis'].map((s, i) => (
                  <span
                    key={s}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      i % 2 === 0
                        ? 'bg-primary/12 text-primary border-primary/25'
                        : 'bg-accent/12 text-accent border-accent/25'
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                {['Machine Learning Engineer', 'Data Scientist'].map((r, i) => (
                  <div key={r} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-border/40">
                    <span className="text-lg">{i === 0 ? '🤖' : '📊'}</span>
                    <span className="text-sm font-medium">{r}</span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 border border-primary/15">Match</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 glass-card rounded-2xl px-4 py-3 flex items-center gap-2.5 float-y" style={{ animationDelay: '1.2s' }}>
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#06281c]" />
              </span>
              <div>
                <p className="text-xs font-semibold leading-none">Genie says</p>
                <p className="text-[11px] text-muted-foreground mt-1">“You're a strong ML fit ✨”</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="container-site py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="eyebrow mb-3">What's inside</span>
          <h2 className="font-display text-4xl font-bold tracking-tight">Three tools, one genie</h2>
          <p className="mt-4 text-muted-foreground">Everything you need to go from resume to offer, working together.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="glass-card rounded-2xl p-7 group hover:border-primary/30 hover:shadow-[0_0_30px_oklch(0.72_0.16_162/0.1)] transition-all duration-200"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/12 border border-primary/20 text-primary mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-semibold mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{tool.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                  {tool.cta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="container-site py-20">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="eyebrow mb-3">How it works</span>
          <h2 className="font-display text-4xl font-bold tracking-tight">From resume to offer in three steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.n} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-display text-3xl font-bold gradient-text">{step.n}</span>
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/12 border border-accent/20 text-accent">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA band */}
      <section className="container-site pb-24">
        <div className="glass-card rounded-3xl px-8 py-14 text-center hero-glow overflow-hidden">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-5 shadow-[0_0_24px_oklch(0.72_0.16_162/0.4)]">
            <Sparkles className="h-6 w-6 text-[#06281c]" />
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight">Ready to get hired?</h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Start with your resume — your matched roles carry straight into job discovery.
          </p>
          <Link
            href="/resume"
            className="btn-gradient rounded-xl px-7 py-3.5 text-sm inline-flex items-center gap-2 mt-8"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
