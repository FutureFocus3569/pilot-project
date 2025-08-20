#!/bin/bash

echo "🔥 NUCLEAR OPTION: Complete Routing Conflict Resolution"
echo "================================================"

# Kill all Next.js processes
echo "1. Killing all Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Remove the conflicting directory completely
echo "2. Removing conflicting admin directory..."
rm -rf "/Users/courtneyeverest/Pilot Project/childcare-dashboard/src/app/(dashboard)/admin"
rm -rf "/Users/courtneyeverest/Pilot Project/childcare-dashboard/src/app/(dashboard)/admin/"*

# Clear all Next.js caches
echo "3. Clearing Next.js caches..."
rm -rf "/Users/courtneyeverest/Pilot Project/childcare-dashboard/.next"
rm -rf "/Users/courtneyeverest/Pilot Project/childcare-dashboard/.next/"*

# Clear node modules cache (optional but thorough)
echo "4. Clearing node modules cache..."
rm -rf "/Users/courtneyeverest/Pilot Project/childcare-dashboard/node_modules/.cache" 2>/dev/null || true

echo "5. Verification..."
if [ -d "/Users/courtneyeverest/Pilot Project/childcare-dashboard/src/app/(dashboard)/admin" ]; then
    echo "❌ Conflicting directory still exists"
else
    echo "✅ Conflicting directory successfully removed"
fi

if [ -d "/Users/courtneyeverest/Pilot Project/childcare-dashboard/.next" ]; then
    echo "❌ Cache still exists"
else
    echo "✅ Cache successfully cleared"
fi

echo "6. Checking remaining admin files..."
find "/Users/courtneyeverest/Pilot Project/childcare-dashboard" -name "page.tsx" -path "*admin*" | head -5

echo ""
echo "🚀 Ready to start fresh server!"
echo "Run: npm run dev"
