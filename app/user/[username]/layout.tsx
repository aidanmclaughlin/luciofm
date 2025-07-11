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
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-7 lg:px-10 py-5 sm:py-7 lg:py-10">
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