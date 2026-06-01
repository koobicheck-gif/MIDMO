'use client'

import MapWrapper from '@/components/map/MapWrapper'
import { RevenueChart } from '@/components/charts/RevenueChart'

interface Props {
  dumpsters: any[]
  revenueByMonth: { month: string; revenue: number }[]
  chartOnly?: boolean
}

export default function DashboardClientSection({ dumpsters, revenueByMonth, chartOnly }: Props) {
  if (chartOnly) {
    return <RevenueChart data={revenueByMonth} />
  }
  return <MapWrapper dumpsters={dumpsters} height="260px" showLegend={false} />
}
