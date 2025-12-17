#!/bin/bash
# Restart the Next.js dev server with clean cache

echo "Stopping dev server..."
pkill -f "next dev" || true
sleep 2

echo "Cleaning cache..."
rm -rf .next

echo "Starting dev server..."
npm run dev:3005


