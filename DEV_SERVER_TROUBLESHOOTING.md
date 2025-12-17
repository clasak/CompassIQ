# Dev Server Troubleshooting Guide

## Quick Fix for React Hook Errors

If you encounter React Hook errors like:
```
TypeError: Cannot read properties of null (reading 'useContext')
Warning: Invalid hook call
```

### Solution: Clean Restart

Run the clean restart script:
```bash
npm run dev:clean:3005
```

Or manually:
```bash
# 1. Clean the build cache
rm -rf .next

# 2. Kill any processes on port 3005
lsof -ti:3005 | xargs kill -9

# 3. Start the dev server
PORT=3005 npm run dev
```

## Common Issues

### 1. Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3005`

**Solution:**
```bash
lsof -ti:3005 | xargs kill -9
```

### 2. React Hook Errors
**Error:** `Cannot read properties of null (reading 'useContext')`

**Cause:** Corrupted Next.js build cache

**Solution:** Clean the `.next` directory and restart (see Quick Fix above)

### 3. Module Not Found
**Error:** `Cannot find module '/path/to/.next/server/pages/_document.js'`

**Cause:** Incomplete or corrupted build

**Solution:** Clean restart (see Quick Fix above)

## Prevention

To prevent these issues:

1. **Always use the clean restart script** when switching branches:
   ```bash
   npm run dev:clean:3005
   ```

2. **After pulling changes** that modify dependencies or configuration:
   ```bash
   npm install
   npm run dev:clean:3005
   ```

3. **If the dev server crashes**, don't just restart it - use the clean restart script

## Available Scripts

- `npm run dev:3005` - Start dev server on port 3005 (normal start)
- `npm run dev:clean:3005` - Clean restart on port 3005 (recommended)
- `npm run dev:verify` - Verify dev server is running correctly

## Browser Testing

The app runs on: **http://localhost:3005**

To test in the browser:
1. Ensure dev server is running (check terminal for "Ready" message)
2. Navigate to http://localhost:3005
3. You should be redirected to `/app/operate` (the command center)

## Notes

- The dev server uses port **3005** (not 3000)
- First compilation can take 20-30 seconds
- Subsequent hot reloads are much faster
- If you see webpack warnings about "big strings", these are safe to ignore
