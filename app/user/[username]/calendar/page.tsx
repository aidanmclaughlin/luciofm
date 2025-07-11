'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getRecentTracks } from '@/lib/lastfm'
import Link from 'next/link'

interface DayData {
  date: Date
  count: number
  tracks: any[]
}

export default function CalendarPage() {
  const params = useParams()
  const username = params.username as string
  
  const [calendarData, setCalendarData] = useState<DayData[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)

  useEffect(() => {
    fetchCalendarData()
  }, [selectedMonth])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      // In a real app, we'd fetch more data, but for now we'll use recent tracks
      const tracks = await getRecentTracks(username, 200)
      
      // Group tracks by day
      const dayMap = new Map<string, DayData>()
      
      tracks.forEach(track => {
        if (track.date) {
          const date = new Date(parseInt(track.date.uts) * 1000)
          const dayKey = date.toDateString()
          
          if (!dayMap.has(dayKey)) {
            dayMap.set(dayKey, {
              date: new Date(date.setHours(0, 0, 0, 0)),
              count: 0,
              tracks: []
            })
          }
          
          const day = dayMap.get(dayKey)!
          day.count++
          day.tracks.push(track)
        }
      })
      
      setCalendarData(Array.from(dayMap.values()))
    } catch (error) {
      console.error('Failed to fetch calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: (Date | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getScrobbleCount = (date: Date | null) => {
    if (!date) return 0
    const dayData = calendarData.find(d => 
      d.date.toDateString() === date.toDateString()
    )
    return dayData?.count || 0
  }

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-white/5'
    if (count < 10) return 'bg-purple-900/30'
    if (count < 25) return 'bg-purple-700/40'
    if (count < 50) return 'bg-purple-600/50'
    if (count < 100) return 'bg-pink-600/60'
    return 'bg-pink-500/70'
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
        Listening Calendar
      </h1>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8 glass rounded-xl p-4">
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold">
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </h2>
          
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="glass rounded-xl p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs sm:text-sm font-medium text-white/60 pb-2">
                {day}
              </div>
            ))}
            
            {getDaysInMonth().map((date, index) => {
              const count = date ? getScrobbleCount(date) : 0
              const isToday = date?.toDateString() === new Date().toDateString()
              
              return (
                <div
                  key={index}
                  onClick={() => date && count > 0 && setSelectedDay(
                    calendarData.find(d => d.date.toDateString() === date.toDateString()) || null
                  )}
                  className={`aspect-square p-1 sm:p-2 rounded-lg transition-all ${
                    date ? `${getHeatmapColor(count)} ${count > 0 ? 'cursor-pointer hover:scale-105' : ''}` : ''
                  } ${isToday ? 'ring-2 ring-pink-500' : ''}`}
                >
                  {date && (
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className="text-xs sm:text-sm">{date.getDate()}</div>
                      {count > 0 && (
                        <div className="text-xs font-bold mt-1">{count}</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="glass rounded-xl p-6 animate-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {selectedDay.date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-white/60 mb-4">{selectedDay.count} tracks played</p>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedDay.tracks.slice(0, 20).map((track, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                  <div>
                    <p className="font-medium">{track.name}</p>
                    <p className="text-sm text-white/60">{track.artist.name}</p>
                  </div>
                  <p className="text-xs text-white/40">
                    {new Date(parseInt(track.date.uts) * 1000).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-white/60">Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-white/5 rounded"></div>
            <div className="w-4 h-4 bg-purple-900/30 rounded"></div>
            <div className="w-4 h-4 bg-purple-700/40 rounded"></div>
            <div className="w-4 h-4 bg-purple-600/50 rounded"></div>
            <div className="w-4 h-4 bg-pink-600/60 rounded"></div>
            <div className="w-4 h-4 bg-pink-500/70 rounded"></div>
          </div>
        <span className="text-white/60">More</span>
      </div>
    </>
  )
}