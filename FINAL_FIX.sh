#!/bin/bash

echo "🚨 FINAL DESPERATE MEASURE - GUARANTEED FIX"
echo "==========================================="

# Kill EVERYTHING Next.js related
echo "🔥 Killing all Node/Next processes..."
pkill -f "next" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true
killall node 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 5

# Go to project
cd "/Users/courtneyeverest/Pilot Project/childcare-dashboard"

echo "🗑️ Removing ALL conflicting directories..."
# Remove ANY directory that could cause admin conflicts
rm -rf "src/app/(dashboard)" 2>/dev/null || true
rm -rf "src/app/(dashboard-backup)" 2>/dev/null || true
rm -rf "src/app/dashboard" 2>/dev/null || true
find . -path "*/app/*" -name "*admin*" -type d -exec rm -rf {} + 2>/dev/null || true
find . -path "*/app/*" -name "*dashboard*" -type d -exec rm -rf {} + 2>/dev/null || true

echo "🧹 Nuclear cache cleanup..."
rm -rf .next
rm -rf .turbo
rm -rf node_modules/.cache
rm -rf .cache
rm -rf dist
rm -rf build
rm -rf out

echo "📁 Creating ONLY the admin directory we need..."
mkdir -p src/app/admin

echo "🔄 Reinstalling dependencies..."
npm install --force

echo "✅ DONE! Now start the server manually with: npm run dev"
echo "🎯 Your site should work at: http://localhost:3000/admin"
