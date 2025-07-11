# Setting Up Your App Icon 🎨

## Convert Your Image

You have the image at `/Users/aidanmclaughlin/Desktop/IMG_6644.heic`

### Option 1: Using Mac Preview (Easiest!)
1. Open the image in Preview
2. File → Export
3. Format: PNG
4. Save as `icon-512.png` in the `public/` folder
5. Resize to 512x512 if needed
6. Then export again as `icon-192.png` at 192x192

### Option 2: Using Online Converter
1. Go to https://heictojpg.com/
2. Upload your HEIC file
3. Convert to PNG
4. Download and resize at https://www.iloveimg.com/resize-image
5. Create both 192x192 and 512x512 versions
6. Save in the `public/` folder

### Option 3: Using Terminal (if you have ImageMagick)
```bash
# Install ImageMagick if needed
brew install imagemagick

# Convert and resize
convert /Users/aidanmclaughlin/Desktop/IMG_6644.heic -resize 512x512 public/icon-512.png
convert /Users/aidanmclaughlin/Desktop/IMG_6644.heic -resize 192x192 public/icon-192.png
```

## File Names Needed:
- `public/icon-192.png` (192x192 pixels)
- `public/icon-512.png` (512x512 pixels)

Once you've created these, push to GitHub and the PWA will use your custom icon! 💕