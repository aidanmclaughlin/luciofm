'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { getTopArtists, getTopTracks, getUserInfo } from '@/lib/lastfm'
import Image from 'next/image'

export default function ComparePage() {
  const params = useParams()
  const username1 = params.username as string
  
  const [username2, setUsername2] = useState('')
  const [comparing, setComparing] = useState(false)
  const [compatibility, setCompatibility] = useState<any>(null)
  const [error, setError] = useState('')

  const calculateCompatibility = async () => {
    if (!username2.trim()) return
    
    setComparing(true)
    setError('')
    
    try {
      // Fetch data for both users
      const [user1Info, user2Info, user1Artists, user2Artists, user1Tracks, user2Tracks] = await Promise.all([
        getUserInfo(username1),
        getUserInfo(username2),
        getTopArtists(username1, 'overall', 50),
        getTopArtists(username2, 'overall', 50),
        getTopTracks(username1, 'overall', 50),
        getTopTracks(username2, 'overall', 50)
      ])
      
      // Find common artists
      const user1ArtistNames = new Set(user1Artists.map(a => a.name.toLowerCase()))
      const user2ArtistNames = new Set(user2Artists.map(a => a.name.toLowerCase()))
      const commonArtists = user1Artists.filter(a => user2ArtistNames.has(a.name.toLowerCase()))
      
      // Find common tracks
      const user1TrackNames = new Set(user1Tracks.map(t => `${t.name.toLowerCase()}-${t.artist.name.toLowerCase()}`))
      const user2TrackNames = new Set(user2Tracks.map(t => `${t.name.toLowerCase()}-${t.artist.name.toLowerCase()}`))
      const commonTracks = user1Tracks.filter(t => user2TrackNames.has(`${t.name.toLowerCase()}-${t.artist.name.toLowerCase()}`))
      
      // Calculate compatibility score
      const artistScore = (commonArtists.length / Math.min(user1Artists.length, user2Artists.length)) * 100
      const trackScore = (commonTracks.length / Math.min(user1Tracks.length, user2Tracks.length)) * 100
      const overallScore = (artistScore + trackScore) / 2
      
      setCompatibility({
        score: Math.round(overallScore),
        user1: user1Info,
        user2: user2Info,
        commonArtists: commonArtists.slice(0, 10),
        commonTracks: commonTracks.slice(0, 10),
        artistScore: Math.round(artistScore),
        trackScore: Math.round(trackScore)
      })
    } catch (err: any) {
      setError(err.message || 'Failed to compare users')
    } finally {
      setComparing(false)
    }
  }

  const getCompatibilityMessage = (score: number) => {
    if (score >= 90) return "Musical soulmates! 💕"
    if (score >= 70) return "Super compatible! 🎵"
    if (score >= 50) return "Pretty good match! 🎶"
    if (score >= 30) return "Some common ground 🎸"
    if (score >= 10) return "Different tastes 🎭"
    return "Opposites attract? 🤷"
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'from-green-400 to-emerald-600'
    if (score >= 40) return 'from-yellow-400 to-orange-600'
    return 'from-red-400 to-pink-600'
  }

  return (
    <>
      {!compatibility && (
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Music Compatibility
          </h1>
          <p className="text-lg text-white/60 mb-8">
            Discover how your music taste matches with your friends
          </p>
          
          <div className="glass rounded-2xl p-8 sm:p-10">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-2">
                  <span className="text-2xl">🎵</span>
                </div>
                <p className="font-semibold">{username1}</p>
              </div>
              <div className="text-xl text-white/40">vs</div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center mb-2">
                  <span className="text-2xl">🎵</span>
                </div>
                <p className="font-semibold text-white/40">Friend</p>
              </div>
            </div>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <input
                type="text"
                value={username2}
                onChange={(e) => setUsername2(e.target.value)}
                placeholder="Enter friend's username"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                onKeyDown={(e) => e.key === 'Enter' && calculateCompatibility()}
              />
              <button
                onClick={calculateCompatibility}
                disabled={comparing || !username2.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:scale-105"
              >
                {comparing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Calculating...
                  </span>
                ) : (
                  'Compare Music Taste'
                )}
              </button>
            </div>
            {error && (
              <p className="mt-4 text-red-400 text-sm">{error}</p>
            )}
          </div>
        </div>
      )}

      {compatibility && (
        <>
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 text-center">
            Music Compatibility
          </h1>
          <div className="space-y-8 animate-in">
            {/* Score Display */}
            <div className="glass rounded-3xl p-8 text-center">
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">{compatibility.user1.name}</h3>
                  {compatibility.user1.image[2]?.['#text'] && (
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto">
                      <Image
                        src={compatibility.user1.image[2]['#text']}
                        alt={compatibility.user1.name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreColor(compatibility.score)} bg-clip-text text-transparent`}>
                    {compatibility.score}%
                  </div>
                  <p className="text-xl mt-2">{getCompatibilityMessage(compatibility.score)}</p>
                </div>
                
                <div className="text-center">
                  <h3 className="font-semibold mb-2">{compatibility.user2.name}</h3>
                  {compatibility.user2.image[2]?.['#text'] && (
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto">
                      <Image
                        src={compatibility.user2.image[2]['#text']}
                        alt={compatibility.user2.name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-400">{compatibility.artistScore}%</p>
                  <p className="text-sm text-white/60">Artist Match</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{compatibility.trackScore}%</p>
                  <p className="text-sm text-white/60">Track Match</p>
                </div>
              </div>
            </div>

            {/* Common Artists */}
            {compatibility.commonArtists.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Artists You Both Love</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {compatibility.commonArtists.map((artist: any) => (
                    <div key={artist.name} className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-2 flex items-center justify-center">
                        <span className="text-2xl">🎤</span>
                      </div>
                      <p className="text-sm font-medium truncate">{artist.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Tracks */}
            {compatibility.commonTracks.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Tracks You Both Love</h3>
                <div className="space-y-2">
                  {compatibility.commonTracks.map((track: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                      <span className="text-lg">🎵</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.name}</p>
                        <p className="text-sm text-white/60 truncate">{track.artist.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setCompatibility(null)}
              className="w-full max-w-md mx-auto block px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
            >
              Compare with someone else
            </button>
          </div>
        </>
      )}
    </>
  )
}