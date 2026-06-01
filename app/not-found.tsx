import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card-strong p-8 text-center max-w-sm w-full">
        <div className="text-6xl font-mono font-bold text-green-400 mb-2">404</div>
        <h2 className="text-lg font-bold text-mint mb-2">Page not found</h2>
        <p className="text-sm text-mint-muted mb-6">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7' }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
