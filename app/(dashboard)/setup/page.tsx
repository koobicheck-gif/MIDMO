import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SetupClient from './SetupClient'

export const metadata = { title: 'Setup & Launchpad — Mid Mo Roll Offs' }

const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'

export default async function SetupPage() {
  if (!IS_STATIC) {
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== 'OWNER') redirect('/')
  }
  return <SetupClient />
}
