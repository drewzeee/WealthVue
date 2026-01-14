import { Header } from '@/components/shared'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container py-6">{children}</main>
    </div>
  )
}
