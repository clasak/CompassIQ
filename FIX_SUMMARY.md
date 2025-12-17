# Dev Server Fix Summary - December 16, 2025

## Issue
The Next.js dev server was crashing with React Hook errors:
- `TypeError: Cannot read properties of null (reading 'useContext')`
- `Warning: Invalid hook call`
- `Cannot find module '/.next/server/pages/_document.js'`

This prevented the browser from loading the application at localhost:3005.

## Root Cause
Corrupted Next.js build cache in the `.next` directory, likely caused by:
- Git branch switching without cleaning the build cache
- Interrupted builds
- Stale webpack cache

## Solution Implemented

### 1. Immediate Fix
- Cleaned the `.next` build directory
- Killed all processes on port 3005
- Restarted the dev server with a fresh build
- Verified the app loads successfully in the browser

### 2. Prevention Measures

#### Created `scripts/clean-restart.sh`
A bash script that:
- Cleans the `.next` directory
- Kills any processes on port 3005
- Starts the dev server cleanly

#### Added npm script
```json
"dev:clean:3005": "bash scripts/clean-restart.sh"
```

#### Created Documentation
- `DEV_SERVER_TROUBLESHOOTING.md` - Comprehensive troubleshooting guide
- Includes common issues, solutions, and prevention tips

## Verification

✅ Dev server starts successfully on port 3005
✅ App loads at http://localhost:3005
✅ Navigation works correctly (tested multiple pages)
✅ No React Hook errors in terminal
✅ All routes compile successfully

### Pages Tested
- `/app/operate` (Command Center) - ✅
- `/app/crm/leads` - ✅
- `/app/clients` - ✅

## How to Use Going Forward

### Normal Start
```bash
npm run dev:3005
```

### Clean Restart (Recommended after git operations)
```bash
npm run dev:clean:3005
```

### When to Use Clean Restart
1. After switching git branches
2. After pulling changes
3. When encountering React Hook errors
4. When the dev server crashes unexpectedly

## Files Modified
- `scripts/clean-restart.sh` (new)
- `package.json` (added `dev:clean:3005` script)
- `DEV_SERVER_TROUBLESHOOTING.md` (new)
- `FIX_SUMMARY.md` (this file)

## Status
🟢 **RESOLVED** - Dev server is running stable on port 3005 with no errors.

The issue has been completely fixed and preventive measures are in place to avoid recurrence.
