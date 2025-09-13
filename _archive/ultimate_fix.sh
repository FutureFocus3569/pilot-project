#!/bin/bash

echo "🔥 ULTIMATE NUCLEAR OPTION"
echo "=========================="

# Kill everything
killall node 2>/dev/null || true
pkill -f next 2>/dev/null || true
sleep 3

# Go to project directory  
cd "/Users/courtneyeverest/Pilot Project/childcare-dashboard"

# Remove ALL admin directories
find . -type d -name "admin" -exec rm -rf {} + 2>/dev/null || true

# Clear all caches
rm -rf .next
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true

# Create a fresh admin directory ONLY in the root app folder
mkdir -p src/app/admin

echo "✅ Completed nuclear cleanup"
echo "Now we need to recreate your admin page..."
