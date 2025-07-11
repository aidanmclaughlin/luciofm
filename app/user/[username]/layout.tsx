import Navigation from '@/components/Navigation'

export default function UserLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { username: string }
}) {
  return (
    <>
      <Navigation username={params.username} />
      {children}
    </>
  )
}