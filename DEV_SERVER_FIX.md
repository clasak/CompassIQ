# Dev Server 404 Fix

## Issue
Getting 404 errors for Next.js static assets:
- `_next/static/chunks/main-app.js`
- `_next/static/chunks/app-pages-internals.js`
- `_next/static/media/*.woff2`

## Solution

### Step 1: Stop Current Dev Server
If the dev server is running, stop it:
- Press `Ctrl+C` in the terminal where it's running
- Or kill the process if needed

### Step 2: Clear Build Cache (Already Done)
The `.next` directory has been cleared.

### Step 3: Restart Dev Server
```bash
npm run dev
```

The server should start on port 3000 by default. If 3000 is in use, Next.js will automatically use the next available port (3001, 3002, etc.)

### Step 4: Check Port
After starting, check the terminal output. It will show:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
```

**Important**: Make sure you're accessing the correct port in your browser!

### Step 5: Hard Refresh Browser
After the server restarts:
- **Mac**: Cmd+Shift+R
- **Windows/Linux**: Ctrl+Shift+R

Or clear browser cache:
- Open DevTools (F12)
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

## If Issues Persist

### Check for Port Conflicts
If you see the server starting on a different port than expected:
```bash
# Check what's using port 3005
lsof -i :3005

# Or check all Next.js processes
ps aux | grep "next dev"
```

### Verify Server is Running
```bash
# Check if Next.js is responding
curl http://localhost:3000
```

### Rebuild Everything
```bash
# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Restart
npm run dev
```

## Common Causes

1. **Port Mismatch**: Browser is on port 3005 but server is on 3000
2. **Stale Cache**: Old build artifacts in `.next` directory
3. **Server Not Running**: Dev server crashed or wasn't started
4. **Multiple Instances**: Multiple dev servers running on different ports

## Verification

After restarting, you should see:
- ✅ No 404 errors in browser console
- ✅ Page loads correctly
- ✅ Static assets load (check Network tab in DevTools)
- ✅ Command Center page loads without errors


