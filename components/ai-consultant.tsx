'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, AlertCircle, User, Copy, Check, Sparkles } from 'lucide-react'
import { APIClient } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

const SUGGESTED_PROMPTS = [
  '✨ What skills should I learn for AI roles?',
  '📊 Review my resume gaps',
  '💰 How do I negotiate my salary?',
  '🚀 Switching career to data science?',
  '🎯 Best remote tech jobs in India?',
]

function GenieAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_oklch(0.81_0.13_82/0.4)]">
      <Sparkles className="h-4 w-4 text-[#241c0e]" />
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 fade-in">
      <GenieAvatar />
      <div className="glass-card rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/80" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/80" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/80" />
          <span className="text-xs text-muted-foreground ml-1">Thinking…</span>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message; isLast: boolean }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const copyText = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderContent = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('```') || line.endsWith('```')) {
        return null
      }
      const isBullet = line.match(/^[\-\*•] /)
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
        .replace(/^[\-\*•] /, '')

      if (isBullet) {
        return (
          <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: formatted }} />
        )
      }
      if (line === '') return <br key={i} />
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} className={i > 0 && lines[i - 1] !== '' ? 'mt-1' : ''} />
    })
  }

  return (
    <div className={cn('flex items-end gap-3 fade-in group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      ) : (
        <GenieAvatar />
      )}

      <div className={cn('max-w-[70%] relative', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-3 text-sm leading-relaxed shadow-lg',
            isUser
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm font-medium'
              : 'glass-card rounded-2xl rounded-bl-sm text-foreground'
          )}
        >
          <div className="space-y-0.5">
            {renderContent(message.content)}
          </div>
        </div>

        {!isUser && (
          <button
            onClick={copyText}
            className="absolute -bottom-5 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

export function AIConsultant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi — I'm your HireGenei career consultant ✨\n\nI can help you with:\n- **Career advice** and role recommendations\n- **Resume feedback** and improvement tips\n- **Skill gap analysis** for your target roles\n- **Salary negotiation** strategies\n\nWhat would you like to figure out today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text?: string) => {
    const userMessage = (text || input).trim()
    if (!userMessage || loading) return

    setInput('')
    setError(null)
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await APIClient.chat(userMessage)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: "Fresh start ✨ What would you like to talk about?",
    }])
    setError(null)
  }

  const showSuggestions = messages.length <= 1

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Chat header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-border/40"
        style={{ background: 'oklch(0.145 0.006 64 / 0.75)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2.5">
          <GenieAvatar />
          <div>
            <p className="text-sm font-semibold leading-none font-display">HireGenei AI</p>
            <p className="text-[10px] text-emerald-300 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
              Online
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.05] border border-border/40 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} isLast={i === messages.length - 1} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested prompts */}
      {showSuggestions && !loading && (
        <div className="flex-shrink-0 px-6 pb-3 fade-in">
          <div className="max-w-3xl mx-auto">
            <p className="text-[11px] text-muted-foreground/60 mb-2 text-center">Try asking</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt.replace(/^[^\w]+ /, ''))}
                  className="px-3 py-1.5 rounded-full text-xs glass-card hover:border-primary/30 hover:text-primary transition-all text-muted-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex-shrink-0 px-6 pb-2 fade-in">
          <div className="max-w-3xl mx-auto flex gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 px-6 pb-5 pt-2">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl flex items-end gap-3 p-3 focus-within:border-primary/40 focus-within:shadow-[0_0_20px_oklch(0.81_0.13_82/0.12)] transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your career…"
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none min-h-[24px] max-h-32 leading-6 disabled:opacity-50"
              style={{ scrollbarWidth: 'none' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className={cn(
                'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                input.trim() && !loading
                  ? 'btn-gradient'
                  : 'bg-white/5 text-muted-foreground cursor-not-allowed'
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/30 mt-2">Enter to send · Shift+Enter for a new line</p>
        </div>
      </div>
    </div>
  )
}
