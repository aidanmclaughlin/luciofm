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
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <Navigation username={params.username} />
        </div>
        <div className="pb-8">
          {children}
        </div>
      </div>
    </div>
  )
}