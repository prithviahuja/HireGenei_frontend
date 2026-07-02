import Link from 'next/link'
import {
  FileText, Briefcase, MessageSquare, Sparkles, ArrowRight, Upload, Target,
  Zap, Mail, Check, Star, ShieldCheck, Clock,
} from 'lucide-react'

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
    href: '/jobs',
    icon: Mail,
    title: 'Match & Outreach',
    desc: 'See how well your resume matches any job, then get a tailored cold email — with the company’s contact found for you.',
    cta: 'Match & email',
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
  { n: '02', icon: Target, title: 'Discover & score matches', desc: 'Your roles flow into Job Discovery — surface live openings and see how well each one matches your resume.' },
  { n: '03', icon: Zap, title: 'Reach out & apply', desc: 'Get a tailored cold email for any role, ask the AI consultant to sharpen your pitch, and apply with confidence.' },
]

const STATS = [
  { value: '10s', label: 'Avg. analysis time' },
  { value: '6+', label: 'Job boards searched' },
  { value: '100%', label: 'Free to start' },
  { value: '24/7', label: 'AI career coach' },
]

const TRUST = ['LinkedIn', 'Indeed', 'Naukri', 'foundit', 'Monster', 'JSearch']

export default function Home() {
  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="hero-glow relative">
        <div className="container-site grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="fade-in">
            <span className="badge-pill mb-6">
              <span className="dot" />
              AI career platform · resume → offer
            </span>
            <h1 className="font-display text-[2.9rem] sm:text-6xl lg:text-[4.4rem] font-bold leading-[1.02] tracking-[-0.04em]">
              Land your next role
              <br />
              with a little <span className="gradient-text">magic.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              HireGenei reads your resume, surfaces jobs that actually fit, scores every match,
              drafts your outreach emails, and coaches you through the search — all in one place.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/resume" className="btn-gradient rounded-xl px-6 py-3.5 text-sm flex items-center gap-2">
                Analyze my resume
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/consultant" className="btn-outline rounded-xl px-6 py-3.5 text-sm font-medium">
                Ask the genie
              </Link>
            </div>
            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {['No sign-up needed', 'PDF resumes', 'Results in seconds'].map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="conic-glow relative">
              <div className="glass-card gradient-border rounded-[1.6rem] p-7 float-y">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-[0.14em]">Resume score</p>
                    <p className="font-display text-2xl font-bold mt-1">Looking good</p>
                  </div>
                  <div className="relative w-20 h-20">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" stroke="oklch(0.3 0.012 264)" strokeWidth="6" fill="none" />
                      <circle
                        cx="40" cy="40" r="32"
                        stroke="url(#heroGrad)" strokeWidth="6" fill="none" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 32}
                        strokeDashoffset={2 * Math.PI * 32 * (1 - 0.82)}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                      />
                      <defs>
                        <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="oklch(0.66 0.2 256)" />
                          <stop offset="100%" stopColor="oklch(0.62 0.23 298)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold gradient-text">82</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Top skills detected</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {['Python', 'Machine Learning', 'SQL', 'React', 'Data Analysis'].map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium border bg-white/[0.04] text-foreground/80 border-white/10">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  {['Machine Learning Engineer', 'Data Scientist'].map((r, i) => (
                    <div key={r} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/15 border border-primary/25">
                        {i === 0 ? <Target className="h-3.5 w-3.5 text-primary" /> : <Briefcase className="h-3.5 w-3.5 text-primary" />}
                      </span>
                      <span className="text-sm font-medium">{r}</span>
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/12 text-primary border border-primary/20">Match</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-5 -left-6 glass-card gradient-border rounded-2xl px-4 py-3 flex items-center gap-2.5 float-y" style={{ animationDelay: '1.2s' }}>
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </span>
                <div>
                  <p className="text-xs font-semibold leading-none">Genie says</p>
                  <p className="text-[11px] text-muted-foreground mt-1">“You're a strong ML fit”</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust marquee */}
        <div className="container-site pb-14">
          <p className="text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-5">
            Searches the boards you already know
          </p>
          <div className="marquee">
            <div className="marquee-track">
              {[...TRUST, ...TRUST].map((name, i) => (
                <span key={i} className="font-display text-lg font-semibold text-muted-foreground/45 whitespace-nowrap">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="container-site">
        <div className="reveal glass-card gradient-border rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.06] overflow-hidden">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 text-center">
              <p className="font-display text-3xl sm:text-4xl font-bold gradient-text tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ BENTO TOOLS ============================ */}
      <section className="container-site py-24">
        <div className="max-w-xl mb-12 reveal">
          <span className="eyebrow mb-3">What's inside</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.035em]">
            Four tools, <span className="gradient-text">one genie</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Everything you need to go from resume to offer, working together as one flow.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 reveal">
          {/* Feature hero tile */}
          <Link
            href="/resume"
            className="card-spotlight glass-card gradient-border rounded-3xl p-8 sm:row-span-2 lg:col-span-1 flex flex-col group"
          >
            <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 border border-primary/25 text-primary mb-6">
              <FileText className="h-5 w-5" />
            </span>
            <h3 className="font-display text-2xl font-semibold mb-2">Start with your resume</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Drop a PDF and the genie extracts your skills, scores your readiness, and matches you to roles in seconds.
            </p>
            <div className="mt-auto space-y-2.5">
              {['Skill extraction', 'Readiness score', 'Best-fit roles'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-4 w-4 text-primary" />
                  {f}
                </div>
              ))}
            </div>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
              Analyze resume <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          {/* Remaining tiles */}
          {TOOLS.slice(1).map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="card-spotlight glass-card gradient-border rounded-3xl p-7 group flex flex-col"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 text-primary mb-5 group-hover:border-primary/30 transition-colors">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-semibold mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{tool.desc}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                  {tool.cta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ============================ HOW IT WORKS ============================ */}
      <section className="container-site py-12 pb-24">
        <div className="text-center max-w-xl mx-auto mb-16 reveal">
          <span className="eyebrow mb-3">How it works</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.035em]">From resume to offer in three steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative reveal">
          {/* connecting line */}
          <div className="hidden md:block absolute top-[34px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.n} className="relative glass-card rounded-2xl p-6 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-[0_8px_24px_oklch(0.62_0.2_264/0.4)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-4xl font-bold text-muted-foreground/20 tabular-nums">{step.n}</span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ============================ QUOTE / SOCIAL PROOF ============================ */}
      <section className="container-site pb-24">
        <div className="reveal glass-card gradient-border rounded-3xl p-10 sm:p-14 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 text-primary fill-primary" />
            ))}
          </div>
          <p className="font-display text-2xl sm:text-3xl font-medium leading-snug tracking-[-0.02em]">
            “It read my resume, found roles I’d never have searched for, and wrote the cold email I
            actually sent. <span className="gradient-text">Two weeks later I had interviews.</span>”
          </p>
          <p className="mt-6 text-sm text-muted-foreground">A job seeker who let the genie do the heavy lifting</p>
        </div>
      </section>

      {/* ============================ CTA BAND ============================ */}
      <section className="container-site pb-28">
        <div className="reveal relative glass-card gradient-border rounded-[2rem] px-8 py-16 text-center overflow-hidden">
          <div className="hero-glow absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 shadow-[0_10px_30px_oklch(0.62_0.2_264/0.5)]">
              <Sparkles className="h-6 w-6 text-white" />
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.035em]">Ready to get hired?</h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Start with your resume — your matched roles carry straight into job discovery.
            </p>
            <Link
              href="/resume"
              className="btn-gradient rounded-xl px-7 py-3.5 text-sm inline-flex items-center gap-2 mt-9"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> No account required</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> Results in seconds</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Free to start</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
