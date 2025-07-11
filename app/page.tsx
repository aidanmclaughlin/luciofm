'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    
    router.push(`/user/${username}`)
  }

  return (
    <main className="min-h-screen h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-950 overflow-hidden">
      <div className="min-h-screen h-screen flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-4xl mx-auto text-center animate-in">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4">
              LúcioFM
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground hidden sm:block">
              A better Last.fm for Lúcio :)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8 sm:mb-16">
            <div className="glass rounded-2xl p-6 sm:p-8 shadow-2xl">
              <label htmlFor="username" className="block text-base sm:text-lg font-medium mb-4">
                Enter your Last.fm username
              </label>
              <div className="space-y-3">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={isLoading || !username.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 text-base"
                >
                  {isLoading ? 'Loading...' : 'View Stats'}
                </button>
              </div>
            </div>
          </form>

          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="glass glass-hover rounded-xl p-6 text-left">
              <div className="text-4xl mb-3">🎵</div>
              <h3 className="text-lg font-semibold mb-2">Recent Tracks</h3>
              <p className="text-sm text-muted-foreground">See what you've been listening to lately</p>
            </div>
            <div className="glass glass-hover rounded-xl p-6 text-left">
              <div className="text-4xl mb-3">🎤</div>
              <h3 className="text-lg font-semibold mb-2">Top Artists</h3>
              <p className="text-sm text-muted-foreground">Discover your favorite artists over time</p>
            </div>
            <div className="glass glass-hover rounded-xl p-6 text-left">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Listening Trends</h3>
              <p className="text-sm text-muted-foreground">Analyze your music taste evolution</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}