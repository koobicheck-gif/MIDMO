export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Settings, Users, Link2, Bell } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if ((session?.user as any)?.role !== 'OWNER') {
    redirect('/')
  }

  return (
    <div className="space-y-4 py-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-mint">Settings</h1>
        <p className="text-xs text-mint-muted">Company configuration — owner only</p>
      </div>

      {/* Company Info */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-mint mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-green-400" />
          Company Information
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Company Name', value: 'Mid Mo Roll Offs' },
            { label: 'Address', value: 'Columbia, MO 65201' },
            { label: 'Phone', value: '(573) 555-0100' },
            { label: 'Email', value: 'owner@midmorolloffs.com' },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-xs font-medium text-mint-muted mb-1">{field.label}</label>
              <input
                defaultValue={field.value}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint focus:outline-none focus:border-green-500/50"
              />
            </div>
          ))}
          <button
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7' }}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-mint mb-4">Dumpster Pricing</h3>
        <div className="space-y-2">
          {[
            { size: '10 yd³', base: 225, day: 40 },
            { size: '15 yd³', base: 275, day: 45 },
            { size: '20 yd³', base: 275, day: 45 },
            { size: '30 yd³', base: 325, day: 45 },
            { size: '40 yd³', base: 450, day: 55 },
          ].map(tier => (
            <div key={tier.size} className="flex items-center gap-3 text-xs">
              <span className="font-mono text-green-400 w-14 flex-shrink-0">{tier.size}</span>
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-mint-muted">Base:</span>
                <input defaultValue={tier.base} type="number" className="w-20 px-2 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-mint font-mono focus:outline-none" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-mint-muted">Day:</span>
                <input defaultValue={tier.day} type="number" className="w-16 px-2 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-mint font-mono focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-mint mb-4 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-green-400" />
          Integrations
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Stripe', env: 'STRIPE_SECRET_KEY', status: 'Configure in .env.local' },
            { name: 'Twilio SMS', env: 'TWILIO_ACCOUNT_SID', status: 'Configure in .env.local' },
            { name: 'Resend Email', env: 'RESEND_API_KEY', status: 'Configure in .env.local' },
            { name: 'Cloudinary', env: 'CLOUDINARY_URL', status: 'Configure in .env.local' },
          ].map(integration => (
            <div key={integration.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div>
                <div className="text-xs font-medium text-mint">{integration.name}</div>
                <div className="text-[10px] text-mint-muted font-mono">{integration.env}</div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full pill-due">{integration.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
