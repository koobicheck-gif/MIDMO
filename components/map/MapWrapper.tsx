import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div
      className="animate-pulse rounded-xl w-full h-full flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}
    >
      <div className="text-xs text-mint-muted">Loading map...</div>
    </div>
  ),
})

export default LeafletMap
