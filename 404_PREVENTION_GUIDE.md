# 404 Error Prevention Guide

## What Happened

You were getting 404 errors for:
- `_next/static/chunks/main-app.js`
- `_next/static/chunks/app-pages-internals.js`

## Root Cause

The `.next` build directory was **corrupted** from a previous build. The dev server was running but couldn't serve the chunk files because:

1. **Corrupted build artifacts** - Old/broken files in `.next` directory
2. **React Hook errors** - "Invalid hook call" and "Cannot read properties of null (reading 'useContext')"
3. **Missing modules** - "Cannot find module '.../.next/server/pages/_document.js'"

## 🚀 NEW: Self-Healing Solution (RECOMMENDED)

We've implemented an automatic self-healing dev server that detects and fixes these issues automatically!

### Use the Self-Healing Dev Server

```bash
# Start the self-healing dev server (recommended)
npm run dev:self-heal:3005

# Or for port 3000
npm run dev:self-heal:3000
```

**What it does automatically:**
- ✅ Monitors for 404 errors, React Hook errors, and missing modules
- ✅ Automatically cleans `.next` and cache when issues detected
- ✅ Restarts the server with a clean build
- ✅ Tracks error patterns and health metrics
- ✅ Prevents cascading failures with intelligent thresholds

**Features:**
- **Error Detection**: Watches for 404s, hook errors, webpack issues
- **Auto-Restart**: Restarts with clean build when threshold exceeded
- **Health Checks**: Periodic monitoring of server health
- **Smart Recovery**: Up to 3 automatic restart attempts
- **Graceful Shutdown**: Handles Ctrl+C cleanly

### Quick Fix Command

If you just need a one-time fix:

```bash
npm run dev:fix
```

This will:
1. Kill any stuck processes
2. Clean build artifacts
3. Restart the dev server

### Health Monitoring (Optional)

Start a separate health check endpoint:

```bash
npm run dev:health
```

Then check health at: `http://localhost:3006/health`

## The Original Fix Applied

1. ✅ Killed the stuck node process on port 3005
2. ✅ Removed corrupted `.next` directory
3. ✅ Cleared `node_modules/.cache`
4. ✅ Restarted dev server with clean build

## How to Prevent This

### 1. Use Self-Healing Dev Server (BEST)

**Recommended approach** - Let the server fix itself:

```bash
npm run dev:self-heal:3005
```

The self-healing server will:
- Detect issues automatically
- Clean and restart when needed
- No manual intervention required

### 2. Quick Manual Fix

If you prefer manual control or need a one-time fix:

```bash
npm run dev:fix
```

### 3. Traditional Clean Build (Fallback)

If you ever see 404 errors for Next.js chunk files, run:

```bash
# Stop the dev server (Ctrl+C)
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

### 4. Watch for Warning Signs

The self-healing server monitors these automatically, but you should know them:
- ❌ React Hook errors in terminal
- ❌ "Cannot find module" errors
- ❌ Webpack errors about undefined properties
- ❌ Pages compiling but returning 404

**With self-healing:** Server restarts automatically
**Without self-healing:** Stop and restart with clean build immediately

### 4. Monitor Dev Server Health

The dev server should show:
- ✅ `✓ Ready in XXXms` message
- ✅ No React Hook errors
- ✅ No webpack errors
- ✅ Pages compile successfully

### 5. Fix the "Too Many Open Files" Warning (Optional)

The dev server is showing `EMFILE: too many open files` warnings. This won't cause 404s but can affect hot reload. To fix:

```bash
# Check current limit
ulimit -n

# Increase limit (temporary, for current terminal session)
ulimit -n 10240

# Or add to ~/.zshrc for permanent fix:
echo "ulimit -n 10240" >> ~/.zshrc
```

## Verification Checklist

After restarting the dev server, verify:

1. ✅ Server shows "Ready" message
2. ✅ No errors in terminal output
3. ✅ Page loads in browser
4. ✅ No 404 errors in browser console
5. ✅ Network tab shows all chunks with 200 status

## Quick Reference

### When You See 404s:

```bash
# 1. Stop dev server (Ctrl+C in terminal)
# 2. Clean build
rm -rf .next node_modules/.cache
# 3. Restart
PORT=3005 npm run dev
# 4. Wait for "Ready" message
# 5. Hard refresh browser (Cmd+Shift+R)
```

### Check if Server is Running:

```bash
# Check what's on port 3005
lsof -i :3005

# Test if server responds
curl http://localhost:3005/_next/static/chunks/main-app.js
# Should NOT return 404
```

## Why This Keeps Happening

The `.next` directory can get corrupted when:
1. Dev server crashes during compilation
2. You switch branches with different dependencies
3. You run production builds then switch back to dev
4. File watchers hit system limits (EMFILE error)

**Solution:** Always clean build when switching contexts or after crashes.

## Emergency Recovery

If nothing works:

```bash
# Nuclear option - full reset
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules
npm install
PORT=3005 npm run dev
```

## Self-Healing Implementation Details

### Error Detection Patterns

The self-healing server monitors for:
- `404.*/_next/static/chunks` - Missing chunk files
- `Cannot find module.*\.next` - Missing Next.js modules
- `Invalid hook call` - React Hook errors
- `Cannot read properties of null.*useContext` - Context errors
- `webpack.*undefined` - Webpack errors
- `ENOENT.*\.next` - File not found in .next
- `Module not found.*\.next` - Module resolution errors

### Auto-Restart Logic

1. **Error Threshold**: 3 errors trigger automatic restart
2. **Max Restarts**: Up to 3 restart attempts
3. **Health Checks**: Every 10 seconds
4. **Clean Process**: Kills stuck processes, removes `.next` and cache
5. **Graceful Recovery**: Waits for filesystem to settle before restart

### Configuration

Environment variables:
- `PORT` - Dev server port (default: 3005)
- `HEALTH_PORT` - Health check endpoint port (default: 3006)

### Files Created

- `scripts/self-healing-dev.ts` - Main self-healing wrapper
- `scripts/health-check-endpoint.ts` - Health monitoring endpoint
- `scripts/auto-fix-404.sh` - Manual fix script

## Current Status

✅ **FIXED** - Dev server is running clean on port 3005
✅ All chunk files loading with 200 status
✅ Page rendering successfully
✅ **NEW**: Self-healing dev server implemented and ready to use
✅ Automatic recovery system in place
✅ Health monitoring available
⚠️ "Too many open files" warnings present (non-critical, affects hot reload only)

## 🎯 Recommended Action

**Start using the self-healing dev server today:**

```bash
npm run dev:self-heal:3005
```

This will prevent future 404 issues from requiring manual intervention.

## 📚 Additional Documentation

- **Quick Start:** `QUICK_START_SELF_HEALING.md`
- **Full Guide:** `SELF_HEALING_DEV_SERVER.md`
- **Implementation:** `SELF_HEALING_IMPLEMENTATION.md`
- **Summary:** `SELF_HEALING_SUMMARY.md`


