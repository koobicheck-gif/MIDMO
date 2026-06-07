'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import {
  LayoutDashboard, MapPin, Truck, Users, CreditCard,
  Calendar, BarChart3, CheckCircle2, XCircle, AlertCircle,
  Loader2, ExternalLink, RefreshCw, Rocket, Database,
  MessageSquare, Mail, Image, ChevronRight, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { IS_STATIC } from '@/lib/mock-data'

type ServiceKey = 'stripe' | 'twilio' | 'resend' | 'cloudinary' | 'database'

interface IntegrationStatus {
  configured: boolean
  live: boolean
  error?: string
}

interface SetupStatus {
  stripe: IntegrationStatus
  twilio: IntegrationStatus
  resend: IntegrationStatus
  cloudinary: IntegrationStatus
  database: IntegrationStatus
  allRequired: boolean
}

const MOCK_STATUS: SetupStatus = {
  database: { configured: true, live: false },
  stripe: { configured: true, live: false },
  twilio: { configured: false, live: false },
  resend: { configured: false, live: false },
  cloudinary: { configured: false, live: false },
  allRequired: true,
}

const FEATURES = [
  {
    href: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
    color: '#22c55e',
    desc: 'Live KPIs, mini-map, revenue chart, and activity feed',
  },
  {
    href: '/assets',
    icon: MapPin,
    label: 'Asset Tracker',
    color: '#3b82f6',
    desc: 'Full-screen Leaflet map with color-coded dumpster pins',
  },
  {
    href: '/fleet',
    icon: Truck,
    label: 'Fleet',
    color: '#f59e0b',
    desc: 'Dumpster status cards, filter by status, create jobs inline',
  },
  {
    href: '/crm',
    icon: Users,
    label: 'CRM',
    color: '#a78bfa',
    desc: 'Customer list, detail panel, job history, and invoices',
  },
  {
    href: '/billing',
    icon: CreditCard,
    label: 'Billing',
    color: '#34d399',
    desc: 'Invoices, Stripe payments, Venmo requests, cash recording',
  },
  {
    href: '/dispatch',
    icon: Calendar,
    label: 'Dispatch',
    color: '#fb923c',
    desc: 'Drag-and-drop job assignment across driver columns by date',
  },
  {
    href: '/reports',
    icon: BarChart3,
    label: 'Reports',
    color: '#f472b6',
    desc: 'Revenue trends, fleet utilization, payment method breakdown',
  },
]

const INTEGRATIONS: {
  key: ServiceKey
  label: string
  icon: React.ElementType
  required: boolean
  color: string
  description: string
  docsUrl: string
  setupSteps: string[]
}[] = [
  {
    key: 'database',
    label: 'Database',
    icon: Database,
    required: true,
    color: '#22c55e',
    description: 'PostgreSQL via Neon — stores all jobs, customers, invoices, and payments.',
    docsUrl: 'https://neon.tech',
    setupSteps: [
      'Go to neon.tech and create a new project',
      'Copy the "pooled" connection string',
      'Add it as DATABASE_URL in Vercel environment variables',
      'Run: npx prisma migrate deploy && npx prisma db seed',
    ],
  },
  {
    key: 'stripe',
    label: 'Stripe',
    icon: CreditCard,
    required: true,
    color: '#6366f1',
    description: 'Processes card payments and sends payment confirmations via webhook.',
    docsUrl: 'https://dashboard.stripe.com/apikeys',
    setupSteps: [
      'Go to dashboard.stripe.com → Developers → API Keys',
      'Copy your Secret key and Publishable key',
      'Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to Vercel',
      'Add webhook endpoint: your-domain.vercel.app/api/stripe/webhook',
      'Select event: payment_intent.succeeded',
      'Copy the webhook signing secret → STRIPE_WEBHOOK_SECRET',
    ],
  },
  {
    key: 'twilio',
    label: 'Twilio SMS',
    icon: MessageSquare,
    required: false,
    color: '#ef4444',
    description: 'Sends Venmo payment request links to customers via text message.',
    docsUrl: 'https://console.twilio.com',
    setupSteps: [
      'Go to console.twilio.com and sign in',
      'Copy your Account SID and Auth Token from the dashboard',
      'Get a phone number: Phone Numbers → Buy a Number',
      'Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to Vercel',
    ],
  },
  {
    key: 'resend',
    label: 'Resend Email',
    icon: Mail,
    required: false,
    color: '#f59e0b',
    description: 'Delivers invoice emails and payment receipts to customers.',
    docsUrl: 'https://resend.com/api-keys',
    setupSteps: [
      'Go to resend.com and create an account',
      'Add and verify your sending domain',
      'Create an API key → copy it',
      'Add RESEND_API_KEY to Vercel environment variables',
    ],
  },
  {
    key: 'cloudinary',
    label: 'Cloudinary',
    icon: Image,
    required: false,
    color: '#3b82f6',
    description: 'Stores company logo and any photo uploads from the Settings page.',
    docsUrl: 'https://cloudinary.com/console',
    setupSteps: [
      'Go to cloudinary.com and create an account',
      'Copy Cloud Name, API Key, and API Secret from the dashboard',
      'Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to Vercel',
    ],
  },
]

function StatusIcon({ ok, size = 'sm' }: { ok: boolean | null; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  if (ok === null) return <AlertCircle className={cn(cls, 'text-amber-400')} />
  if (ok) return <CheckCircle2 className={cn(cls, 'text-green-400')} />
  return <XCircle className={cn(cls, 'text-red-400')} />
}

function IntegrationCard({
  integration,
  status,
}: {
  integration: (typeof INTEGRATIONS)[0]
  status?: IntegrationStatus
}) {
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [expanded, setExpanded] = useState(false)

  const testMutation = useMutation({
    mutationFn: async () => {
      if (IS_STATIC) {
        await new Promise(r => setTimeout(r, 800))
        return { ok: true, message: `${integration.label} connection verified (demo mode)` }
      }
      const res = await fetch('/api/setup/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: integration.key }),
      })
      return res.json()
    },
    onSuccess: (data) => {
      setTestResult(data)
      if (data.ok) {
        toast.success(`${integration.label} connected`, { description: data.message })
      } else {
        toast.error(`${integration.label} failed`, { description: data.message })
      }
    },
  })

  const isConfigured = IS_STATIC
    ? integration.key === 'database' || integration.key === 'stripe'
    : status?.configured

  const Icon = integration.icon

  return (
    <div
      className={cn(
        'glass-card overflow-hidden transition-all',
        isConfigured ? 'border-green-500/20' : 'border-white/10'
      )}
    >
      {/* Status bar */}
      <div
        className="h-1"
        style={{
          background: isConfigured
            ? `linear-gradient(90deg, ${integration.color}, ${integration.color}88)`
            : 'rgba(255,255,255,0.08)',
        }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${integration.color}18`, border: `1px solid ${integration.color}30` }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color: integration.color, width: 18, height: 18 }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-mint">{integration.label}</span>
                {integration.required && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-medium">
                    REQUIRED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StatusIcon ok={isConfigured ?? null} />
                <span className="text-[11px] text-mint-muted">
                  {isConfigured ? 'Configured' : 'Not configured'}
                  {status?.live && ' · Live mode'}
                </span>
              </div>
            </div>
          </div>

          <a
            href={integration.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-white/10 text-mint-muted hover:text-mint transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-[11px] text-mint-muted mb-3 leading-relaxed">{integration.description}</p>

        {/* Test result */}
        {testResult && (
          <div
            className={cn(
              'px-3 py-2 rounded-xl text-[11px] mb-3 flex items-start gap-2',
              testResult.ok
                ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                : 'bg-red-500/10 border border-red-500/20 text-red-300'
            )}
          >
            <StatusIcon ok={testResult.ok} />
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-white/12 text-mint-muted hover:bg-white/8 hover:text-mint transition-colors disabled:opacity-50"
          >
            {testMutation.isPending
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />
            }
            Test Connection
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border border-white/12 text-mint-muted hover:bg-white/8 transition-colors"
          >
            Setup
            <ChevronRight className={cn('w-3 h-3 transition-transform', expanded && 'rotate-90')} />
          </button>
        </div>

        {/* Setup steps */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/8 space-y-2">
            <div className="text-[10px] font-semibold text-mint-muted uppercase tracking-wider mb-2">
              How to configure
            </div>
            {integration.setupSteps.map((step, i) => (
              <div key={i} className="flex gap-2.5 text-[11px] text-mint-muted">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold mt-0.5"
                  style={{ background: `${integration.color}20`, color: integration.color }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-medium mt-2"
              style={{ color: integration.color }}
            >
              Open {integration.label} Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SetupClient() {
  const { data: status, refetch, isFetching } = useQuery<SetupStatus>({
    queryKey: ['setup-status'],
    queryFn: async () => {
      if (IS_STATIC) return MOCK_STATUS
      const res = await fetch('/api/setup/status')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    staleTime: 30 * 1000,
  })

  const configured = INTEGRATIONS.filter(i => {
    if (IS_STATIC) return i.key === 'database' || i.key === 'stripe'
    return status?.[i.key]?.configured
  }).length

  const pct = Math.round((configured / INTEGRATIONS.length) * 100)

  return (
    <div className="space-y-8 py-4 max-w-5xl">

      {/* Hero */}
      <div
        className="relative rounded-2xl overflow-hidden p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(5,46,22,0.8) 60%)',
          border: '1px solid rgba(34,197,94,0.2)',
        }}
      >
        <div className="absolute top-4 right-4 opacity-10">
          <Rocket className="w-32 h-32 text-green-400" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-medium">
              Operations Hub
            </span>
          </div>
          <h1 className="text-2xl font-bold text-mint mb-2">Welcome to Mid Mo Roll Offs</h1>
          <p className="text-sm text-mint-muted max-w-lg leading-relaxed mb-6">
            Your all-in-one dispatch, billing, and fleet management platform.
            Connect your services below to go fully live, or explore the demo with mock data.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#dcfce7',
                boxShadow: '0 4px 12px rgba(22,163,74,0.35)',
              }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <a
              href="https://koobicheck-gif.github.io/MIDMO"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/15 text-mint-muted hover:bg-white/8 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Demo
            </a>
          </div>
        </div>
      </div>

      {/* Setup progress */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-mint">Setup Progress</h2>
            <p className="text-xs text-mint-muted">{configured} of {INTEGRATIONS.length} integrations configured</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-green-400">{pct}%</span>
            <button
              onClick={() => refetch()}
              className={cn('p-1.5 rounded-lg hover:bg-white/10 text-mint-muted hover:text-mint transition-colors', isFetching && 'animate-spin')}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #16a34a, #4ade80)',
            }}
          />
        </div>
        <div className="flex gap-3 mt-3 flex-wrap">
          {INTEGRATIONS.map(i => {
            const ok = IS_STATIC
              ? (i.key === 'database' || i.key === 'stripe')
              : status?.[i.key]?.configured
            return (
              <div key={i.key} className="flex items-center gap-1 text-[11px]">
                <StatusIcon ok={ok ?? null} size="sm" />
                <span className={ok ? 'text-mint' : 'text-mint-muted'}>{i.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Feature tour */}
      <div>
        <h2 className="text-sm font-semibold text-mint mb-1">What's Inside</h2>
        <p className="text-xs text-mint-muted mb-4">Click any feature to jump straight to it</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group glass-card p-4 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                >
                  <Icon className="w-4 h-4" style={{ color: f.color }} />
                </div>
                <div className="text-xs font-semibold text-mint mb-1 flex items-center gap-1">
                  {f.label}
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
                <div className="text-[10px] text-mint-muted leading-relaxed">{f.desc}</div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Integrations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-mint">Integrations</h2>
            <p className="text-xs text-mint-muted">Connect your services — required ones must be configured for billing to work</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INTEGRATIONS.map(i => (
            <IntegrationCard key={i.key} integration={i} status={status?.[i.key]} />
          ))}
        </div>
      </div>

      {/* Quick reference */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-mint mb-4">Quick Reference</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-mint-muted font-medium mb-2 uppercase text-[10px] tracking-wider">Default Logins</div>
            <div className="space-y-1.5 font-mono">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400">OWNER</span>
                <span className="text-mint-muted">owner@midmorolloffs.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400">DRIVER</span>
                <span className="text-mint-muted">jake@midmorolloffs.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400">DRIVER</span>
                <span className="text-mint-muted">marcus@midmorolloffs.com</span>
              </div>
              <div className="text-mint-muted/60 text-[10px]">All passwords: changeme123</div>
            </div>
          </div>
          <div>
            <div className="text-mint-muted font-medium mb-2 uppercase text-[10px] tracking-wider">Useful Commands</div>
            <div className="space-y-1.5">
              {[
                { cmd: 'npm run db:seed', desc: 'Load sample data' },
                { cmd: 'npm run db:studio', desc: 'Open DB browser' },
                { cmd: 'npm run db:migrate', desc: 'Apply schema changes' },
                { cmd: 'npm run dev', desc: 'Start local dev server' },
              ].map(({ cmd, desc }) => (
                <div key={cmd} className="flex items-center gap-2">
                  <code className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-green-400">
                    {cmd}
                  </code>
                  <span className="text-mint-muted text-[10px]">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
