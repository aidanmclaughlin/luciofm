# Building LúcioFM for iOS TestFlight

## Prerequisites

1. **Apple Developer Account** ($99/year) - Required for TestFlight
2. **Mac with Xcode** - Required for building iOS apps
3. **Node.js 20+** - The current version (18.x) is too old for Capacitor CLI

## Setup Steps

### 1. Update Node.js (if needed)
```bash
# Install Node 20+ using homebrew
brew install node@20
# Or use nvm
nvm install 20
nvm use 20
```

### 2. Initialize iOS Project
```bash
# First time setup - adds iOS platform
npm run cap:add

# This creates an ios/ folder with the Xcode project
```

### 3. Build the App
```bash
# Build static version and sync with Capacitor
npm run build:ios
```

### 4. Open in Xcode
```bash
npm run cap:open
# Or manually open: ios/App/App.xcworkspace
```

### 5. Configure in Xcode

1. Select the "App" project in the navigator
2. Under "Signing & Capabilities":
   - Select your Team (Apple Developer account)
   - Change Bundle Identifier if needed (currently: fm.lucio.app)
   - Enable "Automatically manage signing"

3. Under "General":
   - Set Display Name: LúcioFM
   - Set Version: 1.0.0
   - Set Build: 1

### 6. Build for TestFlight

1. Select "Any iOS Device" as the build target
2. Product → Archive
3. Once archived, click "Distribute App"
4. Choose "App Store Connect" → "Upload"
5. Follow the prompts to upload to TestFlight

### 7. TestFlight Setup

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app if needed
3. Go to TestFlight tab
4. Add internal/external testers
5. Submit for review (external testers only)

## Important Notes

- The app currently loads from `https://luciofm.vercel.app` in development
- For production, you'll want to update `capacitor.config.json` to remove the server URL
- Icons and splash screens can be generated using `@capacitor/assets`
- The current PWA icons will be used by default

## Updating the App

When you make changes to the web app:
```bash
# Rebuild and sync
npm run build:ios

# Open Xcode
npm run cap:open

# Then archive and upload again
```

## Native Features

To add native features later, install Capacitor plugins:
```bash
# Examples:
npm install @capacitor/push-notifications
npm install @capacitor/share
npm install @capacitor/haptics
```

Then run `npm run cap:sync` to sync the plugins.