'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavProps {
  username?: string
}

export default function Navigation({ username }: NavProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const navItems = [
    { href: `/user/${username}`, label: 'Overview', icon: '🏠' },
    { href: `/user/${username}/calendar`, label: 'Calendar', icon: '📅' },
    { href: `/user/${username}/loved`, label: 'Loved', icon: '❤️' },
    { href: `/user/${username}/friends`, label: 'Friends', icon: '👥' },
    { href: `/user/${username}/stats`, label: 'Stats', icon: '📊' },
    { href: `/user/${username}/compare`, label: 'Compare', icon: '🎭' },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-center gap-1.5 flex-wrap">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-full transition-all text-sm ${
              pathname === item.href
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
            }`}
          >
            <span className="mr-1.5">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <span>{navItems.find(item => pathname === item.href)?.icon || '🏠'}</span>
            <span>{navItems.find(item => pathname === item.href)?.label || 'Menu'}</span>
          </span>
          <svg className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isMobileMenuOpen && (
          <div className="mt-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 transition-all ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white'
                    : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}