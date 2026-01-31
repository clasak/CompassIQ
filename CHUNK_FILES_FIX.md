# Chunk Files Fix - Prevention Guide

## Issue
Next.js chunk files (`main-app.js` and `app-pages-internals.js`) were returning 404 errors.

## Root Cause
1. Dev server needs time to compile and generate chunk files
2. Stale `.next` directory from production builds can interfere
3. Port mismatch between configured port (3005) and accessed port (3000)

## Fixes Applied

### 1. Updated `next.config.js`
- Added webpack configuration to ensure proper chunk generation in dev mode
- Configured `moduleIds: 'named'` and `chunkIds: 'named'` for consistent chunk naming
- Added `onDemandEntries` configuration for better chunk management

### 2. Updated `package.json`
- Added `dev:3000` script for port 3000
- Added `dev:3005` script for port 3005  
- Added `dev:clean` script to clear cache before starting
- Added `dev:verify` script to verify chunk files are available

### 3. Created Verification Script
- `scripts/verify-dev-server.sh` - Checks if chunk files are available

## Prevention

### Always Use the Correct Port
- Use `npm run dev:3000` for port 3000
- Use `npm run dev:3005` for port 3005
- Default `npm run dev` uses Next.js default (3000)

### If Chunk Files Are Missing
1. Stop the dev server (Ctrl+C)
2. Run `npm run dev:clean` to clear cache and restart
3. Wait 10-15 seconds for initial compilation
4. Verify with `npm run dev:verify` (or manually check network tab)

### Best Practices
- Always wait for "Ready" message before accessing the app
- If you see 404s, wait a few seconds and hard refresh (Cmd+Shift+R)
- Use `dev:clean` if you've run production builds recently

## Verification
Both files should return 200 status:
- `http://localhost:3000/_next/static/chunks/main-app.js`
- `http://localhost:3000/_next/static/chunks/app-pages-internals.js`
