import { Button } from "@/components/ui/button"
import { Header } from "@/components/navBar/navBar"

export default function MainPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Logo */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">PeerPrep</h1>
          </div>

          {/* Tagline */}
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground text-balance">
              Start working on coding interviews with your peers
            </p>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-12 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Start Matching
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
