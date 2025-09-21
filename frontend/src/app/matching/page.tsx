import { Header } from "@/components/navBar/navBar"

export default function MatchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Find Your Match</h1>
          <p className="text-muted-foreground">Connect with peers for collaborative coding practice.</p>
        </div>
      </main>
    </div>
  )
}
