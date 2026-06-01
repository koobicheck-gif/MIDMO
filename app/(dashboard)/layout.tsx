import Providers from '@/components/layout/Providers'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import NewJobModal from '@/components/modals/NewJobModal'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="min-h-screen">
        <Sidebar />

        {/* Main content pushed right on desktop by sidebar width */}
        <div className="md:ml-64">
          <Header />

          <main className="pt-16 pb-20 md:pb-6 px-4 md:px-6 min-h-screen">
            {children}
          </main>
        </div>

        <MobileNav />
        <NewJobModal />
      </div>
    </Providers>
  )
}
