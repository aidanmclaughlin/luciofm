// Simple script to remind you how to generate icons
console.log(`
To generate PNG icons from the SVG:

1. Using an online converter:
   - Go to https://cloudconvert.com/svg-to-png
   - Upload public/icon.svg
   - Set size to 192x192 and 512x512
   - Download and save as icon-192.png and icon-512.png in public/

2. Or using ImageMagick (if installed):
   convert public/icon.svg -resize 192x192 public/icon-192.png
   convert public/icon.svg -resize 512x512 public/icon-512.png

3. Or create them manually in any image editor!
`)