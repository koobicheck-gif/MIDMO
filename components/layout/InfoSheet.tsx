'use client'

import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const SetupClient = dynamic(() => import('@/app/(dashboard)/setup/SetupClient'), { ssr: false })

export function InfoButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-xl border border-white/10 text-mint-muted hover:bg-white/10 hover:text-mint transition-colors',
          className
        )}
        aria-label="App info & setup"
      >
        <Info className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div
            className="relative ml-auto h-full w-full max-w-2xl overflow-y-auto"
            style={{
              background: 'rgba(5, 30, 15, 0.98)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/8"
              style={{ background: 'rgba(5, 30, 15, 0.98)', backdropFilter: 'blur(24px)' }}
            >
              <span className="text-sm font-semibold text-mint">Setup & Info</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-mint-muted hover:text-mint transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-8">
              <SetupClient />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
