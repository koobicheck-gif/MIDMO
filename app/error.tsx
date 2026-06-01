'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card-strong p-8 text-center max-w-sm w-full">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-mint mb-2">Something went wrong</h2>
        <p className="text-sm text-mint-muted mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
