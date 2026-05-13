#!/bin/sh

# Ensure subdirectories exist on the persistent volume
mkdir -p /app/storage/uploads /app/storage/downloads /app/storage/exports /app/storage/thumbnails /app/storage/hls

# Symlink individual subfolders to public/storage to avoid lost+found permission issues
# This avoids Next.js scanning the root of the volume where lost+found lives
mkdir -p public/storage
ln -s /app/storage/uploads public/storage/uploads 2>/dev/null
ln -s /app/storage/downloads public/storage/downloads 2>/dev/null
ln -s /app/storage/exports public/storage/exports 2>/dev/null
ln -s /app/storage/thumbnails public/storage/thumbnails 2>/dev/null
ln -s /app/storage/hls public/storage/hls 2>/dev/null

# Start the application
node server.js
