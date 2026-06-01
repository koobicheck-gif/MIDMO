import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  delta?: number
  subtitle?: string
  className?: string
}

export function StatCard({ title, value, icon: Icon, iconColor = 'text-green-400', delta, subtitle, className }: StatCardProps) {
  return (
    <div className={cn('stat-card p-5 flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between">
        <div className={cn('p-2.5 rounded-xl bg-white/8 border border-white/10', iconColor.replace('text-', 'border-').replace('400', '400/20'))}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        {delta !== undefined && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            delta >= 0 ? 'pill-active' : 'pill-overdue'
          )}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold font-mono text-mint">{value}</div>
        <div className="text-xs text-mint-muted mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-green-400/60 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  )
}
