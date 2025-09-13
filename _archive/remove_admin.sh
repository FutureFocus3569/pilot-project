#!/bin/bash
echo "Removing conflicting admin directory..."
rm -rf "/Users/courtneyeverest/Pilot Project/childcare-dashboard/src/app/admin"
echo "Admin directory removed successfully"
ls -la "/Users/courtneyeverest/Pilot Project/childcare-dashboard/src/app/" | grep admin || echo "No admin directory found"
