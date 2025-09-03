'use client'

export default function Header() {
  return (
    <header className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center glow">
              <span className="text-white font-bold text-xl">OS</span>
            </div>
            <h1 className="text-2xl font-semibold text-white/90">One Shot</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="glass rounded-full px-4 py-2">
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
