const legendItems = [
  { color: '#22c55e', label: 'Active' },
  { color: '#f59e0b', label: 'Pickup Due' },
  { color: '#ef4444', label: 'Overdue' },
  { color: '#3b82f6', label: 'Scheduled' },
  { color: '#7c3aed', label: 'Maintenance' },
  { color: '#6b7280', label: 'In Yard' },
]

export default function MapLegend() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 1000,
        background: 'rgba(5, 46, 22, 0.92)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(14px)',
        borderRadius: '12px',
        padding: '10px 14px',
      }}
    >
      <div style={{ fontSize: '10px', color: 'rgba(187,247,208,0.6)', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Status
      </div>
      {legendItems.map(({ color, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: 'rgba(187,247,208,0.75)' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}
