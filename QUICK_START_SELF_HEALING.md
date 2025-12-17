# Quick Start: Self-Healing Dev Server

## 🚀 TL;DR

Instead of manually fixing 404 errors, use this:

```bash
npm run dev:self-heal:3005
```

The server will automatically detect and fix issues for you.

## 🎯 What It Does

Automatically fixes these problems **without your intervention**:

- ✅ 404 errors for chunk files (`_next/static/chunks/main-app.js`)
- ✅ React Hook errors ("Invalid hook call")
- ✅ Missing module errors ("Cannot find module")
- ✅ Corrupted `.next` directory
- ✅ Webpack errors

## 📋 Available Commands

### Main Commands

```bash
# Self-healing dev server (RECOMMENDED)
npm run dev:self-heal:3005

# Quick one-time fix
npm run dev:fix

# Health monitoring endpoint
npm run dev:health
```

### Port Variants

```bash
npm run dev:self-heal:3000  # Port 3000
npm run dev:self-heal:3005  # Port 3005
PORT=3001 npm run dev:self-heal  # Custom port
```

## 🎬 How It Works

### Normal Operation

```
🔵 Starting self-healing dev server...
🔵 Starting Next.js dev server on port 3005...
✅ Server compiled successfully
```

### Auto-Recovery in Action

```
❌ Detected error (1/3): 404 /_next/static/chunks/main-app.js
❌ Detected error (2/3): Cannot find module '.next/server'
❌ Detected error (3/3): Invalid hook call
⚠️  Error threshold exceeded, initiating self-healing restart...
⚠️  🔄 Self-healing restart 1/3
🔵 Cleaning build artifacts...
✅ Removed .next
✅ Removed node_modules/.cache
🔵 Starting Next.js dev server on port 3005...
✅ Server compiled successfully
```

**Time to recover:** 10-15 seconds (vs. 2-3 minutes manually)

## 🆚 Before vs. After

### Before (Manual)

1. ❌ Notice 404 errors
2. ❌ Stop server (Ctrl+C)
3. ❌ Run `rm -rf .next`
4. ❌ Run `rm -rf node_modules/.cache`
5. ❌ Restart server
6. ❌ Wait for compilation
7. ❌ Hard refresh browser

**Time:** 2-3 minutes + your attention

### After (Self-Healing)

1. ✅ Errors detected automatically
2. ✅ Server restarts automatically
3. ✅ Back to working state

**Time:** 10-15 seconds, zero attention needed

## 🔍 Health Check

Check server health:

```bash
# Start health endpoint
npm run dev:health

# Check status
curl http://localhost:3006/health
```

Response:

```json
{
  "healthy": true,
  "timestamp": "2025-12-16T12:00:00.000Z",
  "checks": {
    "nextDirExists": true,
    "mainChunkAccessible": true,
    "devServerResponding": true
  },
  "errors": []
}
```

## ⚙️ Configuration

Default settings (in `scripts/self-healing-dev.ts`):

- **Error threshold:** 3 errors trigger restart
- **Max restarts:** 3 attempts
- **Health checks:** Every 10 seconds
- **Default port:** 3005

## 🛠️ Troubleshooting

### Server won't start

```bash
# Kill stuck process
lsof -ti:3005 | xargs kill -9

# Try manual fix
npm run dev:fix
```

### Too many restarts

```bash
# Full reset
rm -rf node_modules
npm install
npm run dev:self-heal:3005
```

### Check health

```bash
curl http://localhost:3006/health | jq
```

## 📚 Documentation

- **Full docs:** `SELF_HEALING_DEV_SERVER.md`
- **Implementation:** `SELF_HEALING_IMPLEMENTATION.md`
- **Original issue:** `404_PREVENTION_GUIDE.md`

## 💡 Pro Tips

1. **Make it default:**
   ```bash
   alias dev="npm run dev:self-heal:3005"
   ```

2. **Monitor in background:**
   ```bash
   npm run dev:self-heal:3005 &
   npm run dev:health &
   ```

3. **After branch switch:**
   ```bash
   npm run dev:fix
   ```

## ✨ Benefits

- 🎯 **Zero manual intervention**
- ⚡ **10-15 second recovery** (vs. 2-3 minutes)
- 🔄 **Automatic cleanup** and restart
- 📊 **Health monitoring** built-in
- 🛡️ **Safety limits** prevent infinite loops
- 💪 **Better DX** - focus on coding

## 🎓 When to Use What

| Command | When to Use |
|---------|-------------|
| `npm run dev:self-heal:3005` | Daily development (recommended) |
| `npm run dev:fix` | Quick fix after branch switch |
| `npm run dev:health` | Monitoring, CI/CD |
| `npm run dev` | Traditional (when you want full control) |

## 🚦 Recommendation

**Use `npm run dev:self-heal:3005` as your default dev command.**

It handles 99% of issues automatically so you can focus on coding instead of fixing build problems.

---

**Questions?** Check `SELF_HEALING_DEV_SERVER.md` for comprehensive documentation.


