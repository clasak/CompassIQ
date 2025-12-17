#!/bin/bash
# Clean restart script for CompassIQ dev server
# This script prevents React Hook errors by cleaning the build cache and restarting properly

set -e

echo "🧹 Cleaning build cache..."
rm -rf .next

echo "🔍 Checking for processes on port 3005..."
if lsof -ti:3005 > /dev/null 2>&1; then
  echo "⚠️  Found processes on port 3005, killing them..."
  lsof -ti:3005 | xargs kill -9 2>/dev/null || true
  sleep 2
fi

echo "✅ Port 3005 is clear"
echo "🚀 Starting dev server on port 3005..."
PORT=3005 npm run dev
