import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'pill-active'
    case 'PICKUP_DUE': return 'pill-due'
    case 'OVERDUE': return 'pill-overdue'
    case 'SCHEDULED': return 'pill-scheduled'
    case 'MAINTENANCE': return 'pill-maintenance'
    case 'IN_YARD': return 'pill-scheduled'
    case 'COMPLETED': return 'pill-active'
    case 'IN_PROGRESS': return 'pill-scheduled'
    case 'CANCELLED': return 'pill-overdue'
    case 'PAID': return 'pill-active'
    case 'PENDING': return 'pill-scheduled'
    case 'DRAFT': return 'pill-maintenance'
    case 'PARTIAL': return 'pill-due'
    case 'VOID': return 'pill-overdue'
    default: return 'pill-scheduled'
  }
}

export function getStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function getDumpsterPinColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return '#22c55e'
    case 'PICKUP_DUE': return '#f59e0b'
    case 'OVERDUE': return '#ef4444'
    case 'SCHEDULED': return '#3b82f6'
    case 'MAINTENANCE': return '#7c3aed'
    case 'IN_YARD': return '#6b7280'
    default: return '#6b7280'
  }
}
