#!/bin/bash
echo "🔧 Fixing routing conflict..."

# Remove the duplicate admin directory from dashboard route group
echo "Removing (dashboard)/admin directory..."
rm -rf "/Users/courtneyeverest/Pilot Project/childcare-dashboard/src/app/(dashboard)/admin"

echo "Checking remaining admin files..."
find "/Users/courtneyeverest/Pilot Project/childcare-dashboard" -name "admin" -type d

echo "✅ Routing conflict should now be resolved!"
