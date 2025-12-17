#!/bin/bash

# Kill any existing Next.js processes
echo "Stopping existing Next.js servers..."
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
sleep 2

# Clear .next directory
echo "Clearing .next build cache..."
rm -rf .next

# Start dev server
echo "Starting dev server..."
npm run dev


