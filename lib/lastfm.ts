const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/'

export interface Artist {
  name: string
  playcount: string
  url: string
  image: ImageData[]
  mbid?: string
}

export interface Track {
  name: string
  artist: {
    name: string
    mbid?: string
  }
  album?: {
    '#text': string
    mbid?: string
  }
  playcount?: string
  url: string
  image?: ImageData[]
  date?: {
    '#text': string
    uts: string
  }
  '@attr'?: {
    nowplaying: string
  }
}

export interface Album {
  name: string
  artist: {
    name: string
    url: string
  }
  playcount: string
  url: string
  image: ImageData[]
  mbid?: string
}

export interface ImageData {
  '#text': string
  size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega'
}

export interface UserInfo {
  name: string
  realname?: string
  url: string
  country: string
  age: string
  playcount: string
  registered: {
    '#text': number
    unixtime: string
  }
  image: ImageData[]
}

export interface Period {
  value: string
  label: string
}

export const PERIODS: Period[] = [
  { value: '7day', label: 'Last 7 days' },
  { value: '1month', label: 'Last month' },
  { value: '3month', label: 'Last 3 months' },
  { value: '6month', label: 'Last 6 months' },
  { value: '12month', label: 'Last year' },
  { value: 'overall', label: 'All time' }
]

export async function fetchLastFM(params: Record<string, string>) {
  if (!API_KEY) {
    throw new Error('Last.fm API key not configured')
  }

  const url = new URL(BASE_URL)
  url.searchParams.append('api_key', API_KEY)
  url.searchParams.append('format', 'json')
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error(`Last.fm API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.message || 'Last.fm API error')
  }

  return data
}

export async function getUserInfo(username: string): Promise<UserInfo> {
  const data = await fetchLastFM({
    method: 'user.getinfo',
    user: username
  })
  return data.user
}

export async function getRecentTracks(username: string, limit = 10): Promise<Track[]> {
  const data = await fetchLastFM({
    method: 'user.getrecenttracks',
    user: username,
    limit: limit.toString(),
    extended: '1'
  })
  return data.recenttracks.track
}

export async function getTopArtists(username: string, period = 'overall', limit = 12): Promise<Artist[]> {
  const data = await fetchLastFM({
    method: 'user.gettopartists',
    user: username,
    period,
    limit: limit.toString()
  })
  
  return data.topartists.artist
}

export async function getTopAlbums(username: string, period = 'overall', limit = 12): Promise<Album[]> {
  const data = await fetchLastFM({
    method: 'user.gettopalbums',
    user: username,
    period,
    limit: limit.toString()
  })
  return data.topalbums.album
}

export async function getTopTracks(username: string, period = 'overall', limit = 10): Promise<Track[]> {
  const data = await fetchLastFM({
    method: 'user.gettoptracks',
    user: username,
    period,
    limit: limit.toString()
  })
  return data.toptracks.track
}

export function getImageUrl(images: ImageData[], size: ImageData['size'] = 'large'): string {
  // Try to get the requested size first, then try larger sizes
  const sizeOrder: ImageData['size'][] = ['mega', 'extralarge', 'large', 'medium', 'small']
  const startIndex = sizeOrder.indexOf(size)
  
  for (let i = startIndex >= 0 ? startIndex : 0; i < sizeOrder.length; i++) {
    const image = images.find(img => img.size === sizeOrder[i])
    if (image?.['#text'] && !image['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f')) {
      return image['#text']
    }
  }
  
  // If all images are the placeholder, return empty string
  return ''
}

export async function getTrackInfo(artist: string, track: string, username?: string) {
  const params: Record<string, string> = {
    method: 'track.getInfo',
    artist,
    track
  }
  if (username) {
    params.username = username
  }
  const data = await fetchLastFM(params)
  return data.track
}