import Link from 'next/link'
import { Sparkles } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Resume Analyzer', href: '/resume' },
      { label: 'Job Discovery', href: '/jobs' },
      { label: 'AI Consultant', href: '/consultant' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help center', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="container-site py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_16px_oklch(0.62_0.2_264/0.45)]">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <span className="font-display font-bold text-lg gradient-text">HireGenei</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Your AI career genie — read your resume, discover roles that fit, and get coaching whenever you need it.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} HireGenei. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/50">Built for job seekers, powered by AI.</p>
        </div>
      </div>
    </footer>
  )
}
