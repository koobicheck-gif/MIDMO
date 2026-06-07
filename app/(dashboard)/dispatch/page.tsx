'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, CheckCircle } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { MOCK_USERS, MOCK_JOBS, IS_STATIC } from '@/lib/mock-data'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableJobCard({ job, onComplete }: { job: any; onComplete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-mint-muted hover:text-mint p-0.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </div>
        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium',
          job.type === 'DELIVERY' ? 'pill-scheduled' : job.type === 'PICKUP' ? 'pill-active' : 'pill-due'
        )}>
          {job.type}
        </span>
        <StatusPill status={job.status} />
      </div>
      <div className="text-xs font-medium text-mint truncate">{job.customer?.name}</div>
      <div className="text-xs text-mint-muted truncate">{job.address}</div>
      {job.dumpster && (
        <div className="text-[10px] font-mono text-green-400 mt-0.5">{job.dumpster.unitId} · {job.dumpster.sizeYd} yd³</div>
      )}
      {job.status !== 'COMPLETED' && (
        <button
          onClick={() => onComplete(job.id)}
          className="mt-2 w-full py-1.5 rounded-lg text-[11px] font-medium text-green-300 border border-green-500/20 hover:bg-green-500/10 transition-colors flex items-center justify-center gap-1.5"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Mark Complete
        </button>
      )}
    </div>
  )
}

function DriverColumn({ driver, jobs, onComplete }: { driver: any; jobs: any[]; onComplete: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: driver.id })
  const completed = jobs.filter(j => j.status === 'COMPLETED').length

  return (
    <div
      ref={setNodeRef}
      className={cn('glass-card p-4 transition-colors', isOver && 'border-green-500/40 bg-green-500/5')}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-mint">{driver.name}</div>
          <div className="text-xs text-mint-muted">{completed}/{jobs.length} jobs done</div>
        </div>
        <div className="text-xs font-mono text-green-400">
          {jobs.length > 0 ? Math.round(completed / jobs.length * 100) : 0}%
        </div>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${jobs.length > 0 ? (completed / jobs.length * 100) : 0}%` }}
        />
      </div>
      <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[60px]">
          {jobs.map(job => (
            <SortableJobCard key={job.id} job={job} onComplete={onComplete} />
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-6 text-xs text-mint-muted border border-dashed border-white/10 rounded-xl">
              Drop jobs here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

async function fetchDispatch(dateStr: string) {
  if (IS_STATIC) {
    const drivers = MOCK_USERS.filter(u => u.role === 'DRIVER')
    const jobs = MOCK_JOBS.map(j => ({ ...j, driverId: j.driver?.id ?? null }))
    return { drivers, jobs, routes: [] }
  }
  return fetch(`/api/dispatch?date=${dateStr}`).then(r => r.json())
}

export default function DispatchPage() {
  const [date, setDate] = useState(new Date())
  const queryClient = useQueryClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const dateStr = format(date, 'yyyy-MM-dd')
  const { data, isLoading } = useQuery({
    queryKey: ['dispatch', dateStr],
    queryFn: () => fetchDispatch(dateStr),
  })

  const completeMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => {
      if (IS_STATIC) return Promise.resolve({ id, status: 'COMPLETED' })
      return fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED', completedAt: new Date().toISOString() }),
      }).then(r => r.json())
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch', dateStr] })
      toast.success('Job marked complete')
    },
    onError: () => toast.error('Failed to mark job complete'),
  })

  const assignMutation = useMutation({
    mutationFn: ({ jobId, driverId }: { jobId: string; driverId: string }) => {
      if (IS_STATIC) return Promise.resolve({ id: jobId, driverId })
      return fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      }).then(r => r.json())
    },
    onSuccess: (_, { driverId }) => {
      const driverName = drivers.find((d: any) => d.id === driverId)?.name ?? 'driver'
      queryClient.invalidateQueries({ queryKey: ['dispatch', dateStr] })
      toast.success(`Job reassigned to ${driverName}`)
    },
    onError: () => toast.error('Failed to reassign job'),
  })

  const drivers = data?.drivers?.filter((d: any) => d.role === 'DRIVER') ?? []
  const jobs: any[] = data?.jobs ?? []

  const jobsByDriver: Record<string, any[]> = {}
  drivers.forEach((d: any) => {
    jobsByDriver[d.id] = jobs.filter((j: any) => j.driverId === d.id)
  })
  const unassigned = jobs.filter((j: any) => !j.driverId)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeJobId = active.id as string

    // Find source driver
    const sourceDriverId = Object.entries(jobsByDriver).find(([, dJobs]) =>
      dJobs.some(j => j.id === activeJobId)
    )?.[0]

    // Determine target driver — either dropped on driver column or on another job
    const isDriverTarget = drivers.some((d: any) => d.id === over.id)
    const targetDriverId = isDriverTarget
      ? (over.id as string)
      : Object.entries(jobsByDriver).find(([, dJobs]) => dJobs.some(j => j.id === over.id))?.[0]

    if (targetDriverId && targetDriverId !== sourceDriverId) {
      assignMutation.mutate({ jobId: activeJobId, driverId: targetDriverId })
    }
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-mint">Dispatch</h1>
          <p className="text-xs text-mint-muted">{format(date, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(d => subDays(d, 1))} className="p-2 rounded-xl hover:bg-white/10 text-mint-muted hover:text-mint transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setDate(new Date())} className="px-3 py-1.5 rounded-xl text-xs border border-white/15 text-mint-muted hover:bg-white/10 transition-colors flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Today
          </button>
          <button onClick={() => setDate(d => addDays(d, 1))} className="p-2 rounded-xl hover:bg-white/10 text-mint-muted hover:text-mint transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-64 rounded-2xl animate-pulse bg-white/5" />)}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver: any) => (
              <DriverColumn
                key={driver.id}
                driver={driver}
                jobs={jobsByDriver[driver.id] ?? []}
                onComplete={id => completeMutation.mutate({ id })}
              />
            ))}

            {unassigned.length > 0 && (
              <div className="glass-card p-4">
                <div className="text-sm font-semibold text-amber-400 mb-3">Unassigned ({unassigned.length})</div>
                <div className="space-y-2">
                  {unassigned.map((job: any) => (
                    <SortableJobCard key={job.id} job={job} onComplete={id => completeMutation.mutate({ id })} />
                  ))}
                </div>
              </div>
            )}

            {drivers.length === 0 && jobs.length === 0 && (
              <div className="col-span-full text-center py-16 text-mint-muted glass-card">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <div className="text-sm">No jobs scheduled for this date</div>
              </div>
            )}
          </div>
        </DndContext>
      )}
    </div>
  )
}
