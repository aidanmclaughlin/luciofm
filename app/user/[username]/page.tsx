'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserInfo, getRecentTracks, getTopArtists, getTopAlbums, UserInfo, Track, Artist, Album, PERIODS, getImageUrl } from '@/lib/lastfm'
import Link from 'next/link'
import Image from 'next/image'

export default function UserProfile() {
  const params = useParams()
  const username = params.username as string
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const [topArtists, setTopArtists] = useState<Artist[]>([])
  const [topAlbums, setTopAlbums] = useState<Album[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('1month')
  const [loading, setLoading] = useState(true)
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
      const [artists, albums] = await Promise.all([
        getTopArtists(username, selectedPeriod, 12),
        getTopAlbums(username, selectedPeriod, 12)
      ])
      setTopArtists(artists)
      setTopAlbums(albums)
    } catch (err: any) {
      console.error('Failed to load period data:', err)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* User Header */}
        <div className="glass rounded-3xl p-8 mb-8 animate-in">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {userInfo.image[3]?.['#text'] && (
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/20">
                <Image
                  src={userInfo.image[3]['#text']}
                  alt={userInfo.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-bold mb-2">{userInfo.name}</h1>
              {userInfo.realname && (
                <p className="text-xl text-muted-foreground mb-4">{userInfo.realname}</p>
              )}
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <div>
                  <p className="text-3xl font-bold text-primary">{formatNumber(userInfo.playcount)}</p>
                  <p className="text-sm text-muted-foreground">Total Scrobbles</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {new Date(parseInt(userInfo.registered.unixtime) * 1000).getFullYear()}
                  </p>
                  <p className="text-sm text-muted-foreground">Listening Since</p>
                </div>
                {userInfo.country && (
                  <div>
                    <p className="text-3xl font-bold text-primary">{userInfo.country}</p>
                    <p className="text-sm text-muted-foreground">Country</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Currently Playing / Recent Tracks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            {isCurrentlyPlaying && (
              <span className="flex gap-1">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse animation-delay-200"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse animation-delay-400"></span>
              </span>
            )}
            Recent Tracks
          </h2>
          <div className="grid gap-3">
            {recentTracks.map((track, index) => (
              <div
                key={`${track.name}-${track.date?.uts || index}`}
                className="glass glass-hover rounded-xl p-4 flex items-center gap-4 animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {track.image && track.image[2]?.['#text'] ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={track.image[2]['#text']}
                      alt={`${track.album?.['#text'] || track.name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{track.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artist.name} {track.album?.['#text'] && `• ${track.album['#text']}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {track['@attr']?.nowplaying === 'true' ? (
                    <p className="text-sm text-green-500 font-medium">Now Playing</p>
                  ) : track.date ? (
                    <p className="text-sm text-muted-foreground">
                      {new Date(parseInt(track.date.uts) * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PERIODS.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPeriod === period.value
                  ? 'bg-primary text-primary-foreground'
                  : 'glass glass-hover'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Top Artists */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Top Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topArtists.map((artist, index) => (
              <div
                key={artist.name}
                className="glass glass-hover rounded-xl p-4 text-center animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden bg-muted">
                  {(() => {
                    const imageUrl = getImageUrl(artist.image, 'large')
                    console.log(`Artist: ${artist.name}, Image URL:`, imageUrl)
                    return imageUrl && imageUrl.trim() !== '' ? (
                      <Image
                        src={imageUrl}
                        alt={artist.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )
                  })()}
                </div>
                <h3 className="font-semibold truncate mb-1">{artist.name}</h3>
                <p className="text-sm text-muted-foreground">{formatNumber(artist.playcount)} plays</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Albums */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Top Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topAlbums.map((album, index) => (
              <div
                key={`${album.name}-${album.artist.name}`}
                className="glass glass-hover rounded-xl overflow-hidden animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-square">
                  {album.image[3]?.['#text'] ? (
                    <Image
                      src={album.image[3]['#text']}
                      alt={album.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <svg className="w-16 h-16 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate mb-1">{album.name}</h3>
                  <p className="text-sm text-muted-foreground truncate mb-2">{album.artist.name}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(album.playcount)} plays</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes animation-delay-200 {
          animation-delay: 200ms;
        }
        @keyframes animation-delay-400 {
          animation-delay: 400ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  )
}