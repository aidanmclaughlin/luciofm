'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserInfo, getRecentTracks, getTopArtists, getTopAlbums, getTopTracks, UserInfo, Track, Artist, Album, PERIODS, getImageUrl } from '@/lib/lastfm'
import Link from 'next/link'
import Image from 'next/image'

export default function UserProfile() {
  const params = useParams()
  const username = params.username as string
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const [topTracks, setTopTracks] = useState<Track[]>([])
  const [topArtists, setTopArtists] = useState<Artist[]>([])
  const [topAlbums, setTopAlbums] = useState<Album[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('1month')
  const [loading, setLoading] = useState(true)
  const [periodLoading, setPeriodLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [username])

  useEffect(() => {
    if (userInfo) {
      fetchPeriodData()
    }
  }, [selectedPeriod, userInfo])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const [user, recent] = await Promise.all([
        getUserInfo(username),
        getRecentTracks(username, 10)
      ])
      setUserInfo(user)
      setRecentTracks(recent)
    } catch (err: any) {
      setError(err.message || 'Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPeriodData = async () => {
    try {
      setPeriodLoading(true)
      const [tracks, artists, albums] = await Promise.all([
        getTopTracks(username, selectedPeriod, 10),
        getTopArtists(username, selectedPeriod, 12),
        getTopAlbums(username, selectedPeriod, 10)
      ])
      setTopTracks(tracks)
      setTopArtists(artists)
      setTopAlbums(albums)
    } catch (err: any) {
      console.error('Failed to load period data:', err)
    } finally {
      setPeriodLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your music journey...</p>
        </div>
      </div>
    )
  }

  if (error || !userInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Oops!</h2>
          <p className="text-muted-foreground mb-6">{error || 'User not found'}</p>
          <Link href="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString()
  }

  const isCurrentlyPlaying = recentTracks[0]?.['@attr']?.nowplaying === 'true'

  return (
    <>
      <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center text-white/60 hover:text-white transition-all hover:translate-x-1">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/user/${username}`
              if (navigator.share) {
                navigator.share({
                  title: `${username} on LúcioFM`,
                  text: `Check out my music stats on LúcioFM!`,
                  url: shareUrl
                })
              } else {
                navigator.clipboard.writeText(shareUrl)
                alert('Link copied to clipboard!')
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 2.684C18.114 12.938 18 12.482 18 12c0-.482.114-.938.316-1.342m0 2.684a3 3 0 110-2.684m-4.948 9.368a9 9 0 111.06-13.944" />
            </svg>
            Share
          </button>
        </div>

        {/* User Header - Gorgeous new design */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 blur-3xl" />
          <div className="relative bg-black/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
              {userInfo.image[3]?.['#text'] && !userInfo.image[3]['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f') && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-xl opacity-60" />
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-white/20">
                    <Image
                      src={userInfo.image[3]['#text']}
                      alt={userInfo.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="text-center md:text-left flex-1 w-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {userInfo.name}
                </h1>
                {userInfo.realname && (
                  <p className="text-base sm:text-lg text-white/60 mb-4">{userInfo.realname}</p>
                )}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:flex md:gap-6 md:justify-start mt-4 w-full max-w-xs mx-auto md:max-w-none">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{formatNumber(userInfo.playcount)}</p>
                    <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">Scrobbles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                      {Math.floor((Date.now() - parseInt(userInfo.registered.unixtime) * 1000) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                      {Math.floor(parseInt(userInfo.playcount) / Math.floor((Date.now() - parseInt(userInfo.registered.unixtime) * 1000) / (1000 * 60 * 60 * 24)))}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">Daily Avg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Now Playing Banner */}
        {isCurrentlyPlaying && recentTracks[0] && (
          <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 sm:p-6 border border-green-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent animate-pulse" />
            <div className="relative flex items-center gap-4">
              <div className="flex gap-1">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
              </div>
              <div>
                <p className="text-green-400 text-sm uppercase tracking-wider mb-1">Now Playing</p>
                <p className="text-white font-bold text-lg">{recentTracks[0].name}</p>
                <p className="text-white/60">{recentTracks[0].artist.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Period Selector - Dropdown on mobile, pills on desktop */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile dropdown */}
          <div className="sm:hidden flex justify-center">
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent cursor-pointer"
              >
                {PERIODS.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Desktop pills */}
          <div className="hidden sm:flex flex-wrap gap-1.5 justify-center">
            {PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all transform hover:scale-105 ${
                  selectedPeriod === period.value
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout - Top Songs & Albums */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-10 relative ${periodLoading ? 'opacity-50' : ''} transition-opacity`}>
          {/* Top Songs Column */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">
              Top Songs
            </h2>
            <div className="space-y-2">
              {topTracks.map((track, index) => (
                <div
                  key={`${track.name}-${track.artist.name}-${index}`}
                  className="group relative overflow-hidden rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 p-3 transition-all hover:scale-[1.02] hover:border-pink-500/30 animate-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/10 group-hover:to-purple-500/10 transition-all" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm text-pink-400">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{track.name}</p>
                      <p className="text-sm text-white/60 truncate">{track.artist.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-400">{formatNumber(track.playcount || '0')}</p>
                      <p className="text-xs text-white/40">plays</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Albums Column */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              Top Albums
            </h2>
            <div className="space-y-2">
              {topAlbums.map((album, index) => (
                <div
                  key={`${album.name}-${album.artist.name}`}
                  className="group relative overflow-hidden rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-[1.02] hover:border-purple-500/30 animate-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all" />
                  <div className="relative flex items-center gap-3 p-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      {(() => {
                        const imageUrl = getImageUrl(album.image, 'medium')
                        return imageUrl && imageUrl.trim() !== '' ? (
                          <Image
                            src={imageUrl}
                            alt={album.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                            </svg>
                          </div>
                        )
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{album.name}</p>
                      <p className="text-xs text-white/60 truncate">{album.artist.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-pink-400">{formatNumber(album.playcount)}</p>
                      <p className="text-xs text-white/40">plays</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Artists List at Bottom - Beautiful Design */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400">
            Your Top Artists
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {topArtists.map((artist, index) => (
              <div
                key={artist.name}
                className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-white/5 to-white/0 hover:from-white/10 hover:to-white/5 border border-white/10 p-3 sm:p-4 transition-all hover:scale-[1.02] hover:border-white/20 animate-in"
                style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 transition-all">
                      {artist.name}
                    </h3>
                    <span className="text-xl sm:text-2xl font-bold text-white/20">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-lg sm:text-xl font-bold text-white">{formatNumber(artist.playcount)}</p>
                      <p className="text-xs text-white/40 uppercase tracking-wider">plays</p>
                    </div>
                    <div className="h-6 w-px bg-white/20" />
                    <div>
                      <p className="text-sm sm:text-base font-medium text-white/80">
                        {((parseInt(artist.playcount) / parseInt(userInfo.playcount)) * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-white/40">of total</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </>
  )
}