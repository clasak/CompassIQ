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

## The Fix Applied

1. ✅ Killed the stuck node process on port 3005
2. ✅ Removed corrupted `.next` directory
3. ✅ Cleared `node_modules/.cache`
4. ✅ Restarted dev server with clean build

## How to Prevent This

### 1. Always Clean Build When You See 404s

If you ever see 404 errors for Next.js chunk files again, **immediately** run:

```bash
# Stop the dev server (Ctrl+C)
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

### 2. Never Let the Dev Server Get Into a Bad State

Watch for these warning signs:
- ❌ React Hook errors in terminal
- ❌ "Cannot find module" errors
- ❌ Webpack errors about undefined properties
- ❌ Pages compiling but returning 404

**Action:** Stop and restart with clean build immediately.

### 3. Use the Clean Start Script

Add this to `package.json` if not already there:

```json
{
  "scripts": {
    "dev:clean": "rm -rf .next node_modules/.cache && npm run dev"
  }
}
```

Then use `npm run dev:clean` whenever you suspect issues.

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

## Current Status

✅ **FIXED** - Dev server is running clean on port 3005
✅ All chunk files loading with 200 status
✅ Page rendering successfully
⚠️ "Too many open files" warnings present (non-critical, affects hot reload only)
