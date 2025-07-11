import Navigation from '@/components/Navigation'

export default function UserLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { username: string }
}) {
  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-pink-900/20 via-purple-900/10 to-black" />
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Navigation username={params.username} />
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}