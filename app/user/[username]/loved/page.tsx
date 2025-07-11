'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fetchLastFM, getTrackInfo } from '@/lib/lastfm'
import Image from 'next/image'

export default function LovedPage() {
  const params = useParams()
  const username = params.username as string
  
  const [lovedTracks, setLovedTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchLovedTracks()
  }, [username, page])

  const fetchLovedTracks = async () => {
    try {
      setLoading(true)
      const data = await fetchLastFM({
        method: 'user.getlovedtracks',
        user: username,
        page: page.toString(),
        limit: '50'
      })
      
      const tracks = data.lovedtracks.track || []
      
      // Enrich tracks that don't have images with track.getInfo data
      // Only enrich the first 10 tracks to avoid too many API calls
      const enrichedTracks = await Promise.all(
        tracks.map(async (track: any, index: number) => {
          // If track doesn't have a valid image and it's in the first 10 tracks
          if (index < 10 && (!track.image || !track.image[2]?.['#text'] || track.image[2]['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f'))) {
            try {
              const trackInfo = await getTrackInfo(track.artist.name, track.name, username)
              if (trackInfo.album?.image) {
                track.image = trackInfo.album.image
              }
            } catch (error) {
              // If we can't get track info, just use the original track
            }
          }
          return track
        })
      )
      
      setLovedTracks(enrichedTracks)
      setTotalPages(parseInt(data.lovedtracks['@attr'].totalPages))
    } catch (error) {
      console.error('Failed to fetch loved tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock love/unlove functionality (in real app, this would call Last.fm API)
  const toggleLove = (track: any) => {
    // This is just UI feedback - real implementation would need auth
    const newTracks = lovedTracks.map(t => 
      t.url === track.url ? { ...t, loved: !t.loved } : t
    )
    setLovedTracks(newTracks)
  }

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
        Loved Tracks ❤️
      </h1>

        {lovedTracks.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-xl text-white/60">No loved tracks yet!</p>
            <p className="text-sm text-white/40 mt-2">Start loving tracks on Last.fm to see them here</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 mb-8">
              {lovedTracks.map((track, index) => (
                <div
                  key={`${track.name}-${track.artist.name}-${index}`}
                  className="glass glass-hover rounded-xl p-4 flex items-center gap-4 animate-in group"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <button
                    onClick={() => toggleLove(track)}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {track.loved === false ? '🤍' : '❤️'}
                  </button>
                  
                  {track.image && track.image[2]?.['#text'] && !track.image[2]['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f') ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={track.image[2]['#text']}
                        alt={track.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{track.name}</p>
                    <p className="text-sm text-white/60 truncate">{track.artist.name}</p>
                  </div>
                  
                  {track.date && (
                    <p className="text-sm text-white/40 hidden sm:block">
                      Loved {new Date(parseInt(track.date.uts) * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
        </>
      )}
    </>
  )
}