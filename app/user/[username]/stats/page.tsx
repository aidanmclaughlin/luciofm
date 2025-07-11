'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserInfo, getTopArtists, getTopAlbums, getTopTracks, getRecentTracks } from '@/lib/lastfm'

export default function StatsPage() {
  const params = useParams()
  const username = params.username as string
  
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [username])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [userInfo, recentTracks, topArtists, topAlbums, topTracks] = await Promise.all([
        getUserInfo(username),
        getRecentTracks(username, 200),
        getTopArtists(username, 'overall', 100),
        getTopAlbums(username, 'overall', 100),
        getTopTracks(username, 'overall', 100)
      ])

      // Calculate various stats
      const totalScrobbles = parseInt(userInfo.playcount)
      const accountAge = Math.floor((Date.now() - parseInt(userInfo.registered.unixtime) * 1000) / (1000 * 60 * 60 * 24))
      const avgPerDay = Math.round(totalScrobbles / accountAge)
      
      // Time of day analysis
      const hourCounts = new Array(24).fill(0)
      recentTracks.forEach(track => {
        if (track.date) {
          const hour = new Date(parseInt(track.date.uts) * 1000).getHours()
          hourCounts[hour]++
        }
      })
      
      const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
      
      // Day of week analysis
      const dayCounts = new Array(7).fill(0)
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      recentTracks.forEach(track => {
        if (track.date) {
          const day = new Date(parseInt(track.date.uts) * 1000).getDay()
          dayCounts[day]++
        }
      })
      
      const peakDay = dayNames[dayCounts.indexOf(Math.max(...dayCounts))]
      
      // Artist diversity
      const uniqueArtists = new Set(topTracks.map(t => t.artist.name)).size
      const topArtistPlaycount = parseInt(topArtists[0]?.playcount || '0')
      const topArtistPercentage = Math.round((topArtistPlaycount / totalScrobbles) * 100)

      setStats({
        userInfo,
        totalScrobbles,
        accountAge,
        avgPerDay,
        peakHour,
        peakDay,
        hourCounts,
        dayCounts,
        uniqueArtists,
        topArtist: topArtists[0],
        topArtistPercentage,
        topTrack: topTracks[0],
        topAlbum: topAlbums[0],
        milestones: calculateMilestones(totalScrobbles)
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMilestones = (scrobbles: number) => {
    const milestones = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000]
    const reached = milestones.filter(m => scrobbles >= m)
    const next = milestones.find(m => scrobbles < m)
    return { reached, next, progress: next ? (scrobbles / next) * 100 : 100 }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
        Deep Dive Statistics
      </h1>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-pink-400">{stats.totalScrobbles.toLocaleString()}</p>
            <p className="text-sm text-white/60 mt-2">Total Scrobbles</p>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-purple-400">{stats.avgPerDay}</p>
            <p className="text-sm text-white/60 mt-2">Daily Average</p>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-green-400">{stats.accountAge}</p>
            <p className="text-sm text-white/60 mt-2">Days Active</p>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-blue-400">{stats.uniqueArtists}</p>
            <p className="text-sm text-white/60 mt-2">Unique Artists</p>
          </div>
        </div>

        {/* Listening Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Listening by Hour</h3>
            <div className="space-y-2">
              {stats.hourCounts.map((count: number, hour: number) => (
                <div key={hour} className="flex items-center gap-3">
                  <span className="text-sm text-white/60 w-12">{hour}:00</span>
                  <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all ${
                        hour === stats.peakHour ? 'animate-pulse' : ''
                      }`}
                      style={{ width: `${(count / Math.max(...stats.hourCounts)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40 w-8">{count}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60 mt-4">
              Peak listening hour: <span className="text-pink-400 font-semibold">{stats.peakHour}:00</span>
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Listening by Day</h3>
            <div className="space-y-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">{day}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all"
                      style={{ width: `${(stats.dayCounts[index] / Math.max(...stats.dayCounts)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-white/40">{stats.dayCounts[index]}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60 mt-4">
              Most active day: <span className="text-purple-400 font-semibold">{stats.peakDay}</span>
            </p>
          </div>
        </div>

        {/* Top Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Top Artist</h3>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 mx-auto mb-3 flex items-center justify-center">
                <span className="text-4xl">👑</span>
              </div>
              <p className="font-bold">{stats.topArtist?.name}</p>
              <p className="text-sm text-white/60">{stats.topArtist?.playcount} plays</p>
              <p className="text-xs text-pink-400 mt-2">{stats.topArtistPercentage}% of all scrobbles</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Top Track</h3>
            <div className="text-center">
              <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-600/20 mx-auto mb-3 flex items-center justify-center">
                <span className="text-4xl">🎵</span>
              </div>
              <p className="font-bold truncate">{stats.topTrack?.name}</p>
              <p className="text-sm text-white/60 truncate">{stats.topTrack?.artist.name}</p>
              <p className="text-xs text-purple-400 mt-2">{stats.topTrack?.playcount} plays</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Top Album</h3>
            <div className="text-center">
              <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-600/20 mx-auto mb-3 flex items-center justify-center">
                <span className="text-4xl">💿</span>
              </div>
              <p className="font-bold truncate">{stats.topAlbum?.name}</p>
              <p className="text-sm text-white/60 truncate">{stats.topAlbum?.artist.name}</p>
              <p className="text-xs text-green-400 mt-2">{stats.topAlbum?.playcount} plays</p>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Scrobble Milestones</h3>
          <div className="space-y-3">
            {stats.milestones.reached.map((milestone: number) => (
              <div key={milestone} className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <span className="font-medium">{milestone.toLocaleString()} scrobbles</span>
                <span className="text-green-400 text-sm">Achieved!</span>
              </div>
            ))}
            {stats.milestones.next && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-white/60 mb-2">Next milestone: {stats.milestones.next.toLocaleString()}</p>
                <div className="bg-white/10 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all"
                    style={{ width: `${stats.milestones.progress}%` }}
                  />
                </div>
                <p className="text-xs text-white/40 mt-1">{Math.round(stats.milestones.progress)}% complete</p>
              </div>
            )}
        </div>
      </div>
    </>
  )
}