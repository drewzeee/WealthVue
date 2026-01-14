import { SignupForm } from '@/components/auth'

export const metadata = {
  title: 'Create Account - WealthVue',
  description: 'Create your WealthVue account',
}

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/30">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">WealthVue</h1>
        <p className="text-muted-foreground">Your Personal Financial Dashboard</p>
      </div>
      <SignupForm />
    </main>
  )
}
