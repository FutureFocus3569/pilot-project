#!/bin/bash

echo "🎯 SIMPLE WORKING SOLUTION"
echo "========================="

# Go to your project
cd "/Users/courtneyeverest/Pilot Project/childcare-dashboard"

# Kill everything and start fresh
echo "🛑 Stopping everything..."
killall node 2>/dev/null || true
sleep 2

# Clean everything
echo "🧹 Cleaning caches..."
rm -rf .next
rm -rf .turbo

# Start the server
echo "🚀 Starting your site..."
echo "Your site will be available at:"
echo "✅ Main dashboard: http://localhost:3000/dashboard"
echo "✅ Working admin panel: http://localhost:3000/user-management"
echo ""
echo "Opening browser to working admin panel..."

# Start the development server
npm run dev
