'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Container, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setAuthError('')
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setAuthError('Invalid email or password')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4"
          style={{ boxShadow: '0 0 40px rgba(34,197,94,0.2)' }}>
          <Container className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-mint">Mid Mo Roll Offs</h1>
        <p className="text-sm text-mint-muted mt-1">Operations Hub</p>
      </div>

      {/* Card */}
      <div className="glass-card-strong p-8">
        <h2 className="text-lg font-semibold text-mint mb-6">Sign in</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {authError && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {authError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Email address</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="owner@midmorolloffs.com"
              className={cn(
                'w-full px-4 py-3 rounded-xl text-sm bg-white/5 border text-mint placeholder-white/25',
                'focus:outline-none focus:border-green-500/50 transition-colors',
                errors.email ? 'border-red-500/50' : 'border-white/15'
              )}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  'w-full px-4 py-3 rounded-xl text-sm bg-white/5 border text-mint placeholder-white/25 pr-12',
                  'focus:outline-none focus:border-green-500/50 transition-colors',
                  errors.password ? 'border-red-500/50' : 'border-white/15'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mint-muted hover:text-mint transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#dcfce7',
              boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-xs text-mint-muted text-center">Internal use only · Mid Mo Roll Offs</p>
        </div>
      </div>
    </div>
  )
}
