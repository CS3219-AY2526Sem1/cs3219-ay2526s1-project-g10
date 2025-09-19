export function Header() {
    return (
      <header className="w-full bg-primary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <a 
                    href='/'
                    className="text-xl font-bold text-primary-foreground">PeerPrep
                </a>
              </div>
  
              <nav className="hidden md:flex items-center space-x-6">
                <a
                  href="/matching"
                  className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                >
                  Matching
                </a>
                <a
                  href="/history"
                  className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                >
                  Question History
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>
    )
  }
  