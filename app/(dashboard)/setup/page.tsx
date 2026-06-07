import { redirect } from 'next/navigation'

// Setup content is now accessed via the info button (ℹ) in the sidebar/mobile nav.
export default function SetupPage() {
  redirect('/')
}
