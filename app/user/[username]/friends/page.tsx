'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fetchLastFM, getRecentTracks } from '@/lib/lastfm'
import Link from 'next/link'
import Image from 'next/image'

export default function FriendsPage() {
  const params = useParams()
  const username = params.username as string
  
  const [friends, setFriends] = useState<any[]>([])
  const [friendActivity, setFriendActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [customFriends, setCustomFriends] = useState<string[]>([])
  const [newFriend, setNewFriend] = useState('')

  useEffect(() => {
    fetchFriends()
  }, [username])

  const fetchFriends = async () => {
    try {
      setLoading(true)
      
      // Try to get Last.fm friends
      try {
        const data = await fetchLastFM({
          method: 'user.getfriends',
          user: username,
          limit: '50'
        })
        setFriends(data.friends?.user || [])
      } catch {
        // If no friends from API, use custom list
        setFriends([])
      }
      
      // Load custom friends from localStorage
      const saved = localStorage.getItem(`luciofm-friends-${username}`)
      const customList = saved ? JSON.parse(saved) : []
      setCustomFriends(customList)
      
      // Fetch activity for all friends
      await fetchFriendActivity([...friends.map(f => f.name), ...customList])
    } catch (error) {
      console.error('Failed to fetch friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFriendActivity = async (friendUsernames: string[]) => {
    try {
      const activities = await Promise.all(
        friendUsernames.slice(0, 10).map(async (friendUsername) => {
          try {
            const tracks = await getRecentTracks(friendUsername, 3)
            return {
              username: friendUsername,
              tracks: tracks || []
            }
          } catch {
            return { username: friendUsername, tracks: [] }
          }
        })
      )
      
      setFriendActivity(activities.filter(a => a.tracks.length > 0))
    } catch (error) {
      console.error('Failed to fetch friend activity:', error)
    }
  }

  const addFriend = () => {
    if (!newFriend.trim() || customFriends.includes(newFriend)) return
    
    const updated = [...customFriends, newFriend]
    setCustomFriends(updated)
    localStorage.setItem(`luciofm-friends-${username}`, JSON.stringify(updated))
    setNewFriend('')
    
    // Fetch activity for new friend
    fetchFriendActivity([...friends.map(f => f.name), ...updated])
  }

  const removeFriend = (friendUsername: string) => {
    const updated = customFriends.filter(f => f !== friendUsername)
    setCustomFriends(updated)
    localStorage.setItem(`luciofm-friends-${username}`, JSON.stringify(updated))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    )
  }

  const allFriends = [
    ...friends.map(f => ({ name: f.name, realname: f.realname, image: f.image, custom: false })),
    ...customFriends.map(f => ({ name: f, realname: null, image: null, custom: true }))
  ]

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
        Friends Activity
      </h1>

        {/* Add Friend */}
        <div className="glass rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Add Friends</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newFriend}
              onChange={(e) => setNewFriend(e.target.value)}
              placeholder="Enter Last.fm username"
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => e.key === 'Enter' && addFriend()}
            />
            <button
              onClick={addFriend}
              className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all"
            >
              Add
            </button>
          </div>
        </div>

        {/* Friend Activity Feed */}
        {friendActivity.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">What Your Friends Are Listening To</h2>
            <div className="space-y-6">
              {friendActivity.map((activity) => (
                <div key={activity.username} className="glass rounded-xl p-6 animate-in">
                  <Link 
                    href={`/user/${activity.username}`}
                    className="inline-flex items-center gap-2 mb-4 hover:text-pink-400 transition-colors"
                  >
                    <h3 className="text-lg font-semibold">{activity.username}</h3>
                    {activity.tracks[0]?.['@attr']?.nowplaying === 'true' && (
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
                      </span>
                    )}
                  </Link>
                  
                  <div className="space-y-2">
                    {activity.tracks.slice(0, 3).map((track: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        {track.image && track.image[1]?.['#text'] && !track.image[1]['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f') ? (
                          <Image
                            src={track.image[1]['#text']}
                            alt={track.name}
                            width={40}
                            height={40}
                            className="rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                            <span className="text-xs">🎵</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{track.name}</p>
                          <p className="text-xs text-white/60 truncate">{track.artist.name}</p>
                        </div>
                        {track.date && (
                          <p className="text-xs text-white/40">
                            {new Date(parseInt(track.date.uts) * 1000).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Your Friends</h2>
          {allFriends.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-xl text-white/60">No friends added yet!</p>
              <p className="text-sm text-white/40 mt-2">Add some usernames above to see what they're listening to</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allFriends.map((friend) => (
                <div key={friend.name} className="glass rounded-xl p-4 flex items-center gap-4">
                  {friend.image && friend.image[2]?.['#text'] ? (
                    <Image
                      src={friend.image[2]['#text']}
                      alt={friend.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <Link 
                      href={`/user/${friend.name}`}
                      className="font-medium hover:text-pink-400 transition-colors"
                    >
                      {friend.name}
                    </Link>
                    {friend.realname && (
                      <p className="text-sm text-white/60">{friend.realname}</p>
                    )}
                  </div>
                  
                  {friend.custom && (
                    <button
                      onClick={() => removeFriend(friend.name)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  )
}