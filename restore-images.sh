#!/bin/bash
# Restore Real Images from Live Cloudflare Site
# This downloads YOUR original uploaded images before any changes

echo "🖼️  Restoring real images from Cloudflare..."

# Core product images
curl -s https://streamstickpro.com/OIF.jpg -o public/OIF.jpg
curl -s https://streamstickpro.com/UFC.jpg -o public/UFC.jpg
curl -s https://streamstickpro.com/BASEBALL.webp -o public/BASEBALL.webp
curl -s https://streamstickpro.com/download.jpg -o public/download.jpg

# Fire Stick product images
curl -s https://streamstickpro.com/71+Pvh7WB6L._AC_SL1500_.jpg -o "public/71+Pvh7WB6L._AC_SL1500_.jpg"
curl -s https://streamstickpro.com/71E1te69hZL._AC_SL1500_.jpg -o "public/71E1te69hZL._AC_SL1500_.jpg"

# Sports images
curl -s https://streamstickpro.com/c643f060-ea1b-462f-8509-ea17b005318aNFL.jpg -o "public/c643f060-ea1b-462f-8509-ea17b005318aNFL.jpg"

# Carousel images
curl -s https://streamstickpro.com/Playback-Tile-1024x512.webp -o "public/Playback-Tile-1024x512.webp"

echo "✅ All real images restored from Cloudflare"
ls -lh public/OIF.jpg public/UFC.jpg public/BASEBALL.webp | awk '{print "  " $9 ": " $5}'
