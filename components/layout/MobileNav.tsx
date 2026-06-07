'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  Truck,
  Users,
  CreditCard,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { InfoButton } from './InfoSheet'

const navItems = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Assets', href: '/assets', icon: MapPin },
  { label: 'Fleet', href: '/fleet', icon: Truck },
  { label: 'CRM', href: '/crm', icon: Users },
  { label: 'Billing', href: '/billing', icon: CreditCard },
  { label: 'Dispatch', href: '/dispatch', icon: Calendar },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: 'rgba(5, 46, 22, 0.97)',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs transition-colors min-h-[56px]',
                isActive
                  ? 'text-green-400'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg mb-0.5',
                isActive && 'bg-white/10'
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="leading-none text-[10px]">{item.label}</span>
            </Link>
          )
        })}

        {/* Info button */}
        <div className="flex flex-col items-center justify-center px-2 min-h-[56px]">
          <InfoButton />
        </div>
      </div>
    </nav>
  )
}
