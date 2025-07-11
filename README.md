# LúcioFM

A better Last.fm for Lúcio :) - A gorgeous, modern interface built with Next.js and TypeScript.

## Setup

1. Get your Last.fm API key:
   - Go to https://www.last.fm/api/account/create
   - Sign in or create an account
   - Fill out the application form
   - Copy your API key

2. Add your API key to `.env.local`:
   ```
   NEXT_PUBLIC_LASTFM_API_KEY=your_api_key_here
   ```

3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Features

- 🌙 Beautiful dark mode interface
- 🎵 Real-time "Now Playing" indicator
- 📊 Time period filtering (7 days to all time)
- 🎨 Album artwork and artist images
- ✨ Smooth animations and glassmorphism effects
- 📱 Fully responsive design

## Tech Stack

- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS
- Last.fm API