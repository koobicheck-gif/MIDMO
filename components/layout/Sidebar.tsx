'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  MapPin,
  Truck,
  Users,
  CreditCard,
  Calendar,
  BarChart3,
  Settings,
  Container,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Asset Tracker', href: '/assets', icon: MapPin },
  { label: 'Fleet', href: '/fleet', icon: Truck },
  { label: 'CRM', href: '/crm', icon: Users },
  { label: 'Billing', href: '/billing', icon: CreditCard },
  { label: 'Dispatch', href: '/dispatch', icon: Calendar },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300"
      style={{
        width: 'var(--sidebar-width, 256px)',
        background: 'rgba(5, 46, 22, 0.97)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
          <Container className="w-5 h-5 text-green-400" />
        </div>
        <div className="overflow-hidden">
          <div className="text-sm font-bold text-green-400 leading-tight">Mid Mo</div>
          <div className="text-xs text-mint-muted leading-tight">Roll Offs</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-link',
                isActive && 'active'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Settings (owner only) */}
      {role === 'OWNER' && (
        <div className="px-3 py-3 border-t border-white/8">
          <Link
            href="/settings"
            className={cn('nav-link', pathname.startsWith('/settings') && 'active')}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Settings</span>
          </Link>
        </div>
      )}

      {/* User info */}
      <div className="px-4 py-3 border-t border-white/8">
        <div className="text-xs text-mint-muted">{session?.user?.name}</div>
        <div className="text-xs font-mono text-green-400/60">{role}</div>
      </div>
    </aside>
  )
}
