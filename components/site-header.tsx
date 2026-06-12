'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/resume', label: 'Resume' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/consultant', label: 'Consultant' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className="sticky top-0 z-50 border-b border-border/40"
      style={{ background: 'oklch(0.145 0.006 64 / 0.72)', backdropFilter: 'blur(14px)' }}
    >
      <div className="container-site flex items-center justify-between h-16">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_16px_oklch(0.72_0.16_162/0.45)]">
            <Sparkles className="h-4 w-4 text-[#06281c]" />
          </span>
          <span className="font-display font-bold text-lg gradient-text leading-none">HireGenei</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link" data-active={isActive(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/consultant" className="btn-outline rounded-xl px-4 py-2 text-sm font-medium">
            Ask the genie
          </Link>
          <Link
            href="/resume"
            className="btn-gradient rounded-xl px-4 py-2 text-sm flex items-center gap-1.5"
          >
            Analyze resume
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-white/[0.05] text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl fade-in">
          <nav className="container-site flex flex-col py-4 gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/12 text-primary'
                    : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/resume"
              onClick={() => setOpen(false)}
              className="btn-gradient rounded-xl px-4 py-2.5 text-sm mt-2 flex items-center justify-center gap-1.5"
            >
              Analyze resume
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
