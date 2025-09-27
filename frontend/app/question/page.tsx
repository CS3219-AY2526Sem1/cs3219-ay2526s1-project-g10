import { Header } from "../../components/navBar/navBar"

export default function QuestionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Questions</h1>
            <p className="text-muted-foreground">Browse and practice coding interview questions</p>
          </div>

        </div>
      </main>
    </div>
  )
}
