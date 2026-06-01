'use client'

import { signOut, useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { LogOut, User, Plus, Menu } from 'lucide-react'
import { useWeather } from '@/hooks/useWeather'
import { useNewJobModal } from '@/store/useNewJobModal'

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/assets': 'Asset Tracker',
  '/fleet': 'Fleet',
  '/crm': 'CRM',
  '/billing': 'Billing',
  '/dispatch': 'Dispatch',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { data: weather } = useWeather()
  const openModal = useNewJobModal((s) => s.open)

  const pageLabel = PAGE_LABELS[pathname] ?? 'Mid Mo Roll Offs'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between px-4 md:px-6 h-16"
      style={{
        left: 'var(--sidebar-width, 0px)',
        background: 'rgba(5, 46, 22, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: greeting + page label */}
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-lg hover:bg-white/10 text-mint-muted">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="text-xs text-mint-muted hidden sm:block">
            {greeting}, {session?.user?.name?.split(' ')[0] ?? 'there'}
          </div>
          <div className="text-sm font-semibold text-mint">{pageLabel}</div>
        </div>
      </div>

      {/* Right: weather, new job, user */}
      <div className="flex items-center gap-2">
        {/* Weather pill */}
        {weather && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span>{weather.icon}</span>
            <span className="text-mint font-mono">{weather.temperature}°F</span>
            <span className="text-mint-muted">{weather.description}</span>
          </div>
        )}

        {/* New Job button */}
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: '#dcfce7',
            boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Job</span>
        </button>

        {/* User menu */}
        <div className="relative group">
          <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors">
            <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <User className="w-4 h-4 text-green-400" />
            </div>
          </button>
          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
            style={{ background: 'rgba(5,46,22,0.98)', border: '1.5px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)' }}>
            <div className="px-3 py-2 border-b border-white/8">
              <div className="text-xs font-medium text-mint">{session?.user?.name}</div>
              <div className="text-xs text-mint-muted font-mono">{session?.user?.email}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-mint-muted hover:text-mint hover:bg-white/8 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
