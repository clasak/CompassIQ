# Self-Healing Dev Server

An intelligent Next.js development server wrapper that automatically detects and fixes common issues like 404 errors, corrupted builds, and React Hook errors.

## 🚀 Quick Start

### Start the Self-Healing Server

```bash
# Port 3005 (default)
npm run dev:self-heal:3005

# Port 3000
npm run dev:self-heal:3000

# Custom port
PORT=3001 npm run dev:self-heal
```

### One-Time Fix

If you just need to fix the current issue without continuous monitoring:

```bash
npm run dev:fix
```

### Health Monitoring

Start a separate health check endpoint:

```bash
npm run dev:health
```

Then check: `http://localhost:3006/health`

## 🎯 What Problems Does It Solve?

The self-healing server automatically detects and fixes:

1. **404 Errors for Chunk Files**
   - `_next/static/chunks/main-app.js`
   - `_next/static/chunks/app-pages-internals.js`

2. **React Hook Errors**
   - "Invalid hook call"
   - "Cannot read properties of null (reading 'useContext')"

3. **Missing Module Errors**
   - "Cannot find module '.../.next/server/pages/_document.js'"

4. **Webpack Errors**
   - Undefined property errors
   - Module resolution failures

5. **Corrupted Build Directory**
   - Stale `.next` directory
   - Corrupted cache files

## 🔧 How It Works

### 1. Continuous Monitoring

The server monitors all output from the Next.js dev server, looking for error patterns:

```typescript
ERROR_PATTERNS = [
  /404.*\/_next\/static\/chunks/i,
  /Cannot find module.*\.next/i,
  /Invalid hook call/i,
  /Cannot read properties of null.*useContext/i,
  /webpack.*undefined/i,
  /ENOENT.*\.next/i,
  /Module not found.*\.next/i,
]
```

### 2. Error Threshold

- Tracks error count per session
- Triggers auto-restart after **3 errors**
- Resets counter after successful compilation

### 3. Automatic Recovery

When threshold is exceeded:

1. **Stop** the dev server gracefully
2. **Kill** any stuck processes on the port
3. **Clean** build artifacts:
   - Remove `.next` directory
   - Remove `node_modules/.cache`
4. **Wait** for filesystem to settle
5. **Restart** the dev server with clean build

### 4. Health Checks

Periodic health checks every 10 seconds:

- Verify `.next` directory exists
- Check for recent errors
- Monitor server responsiveness

### 5. Safety Limits

- **Max restarts**: 3 attempts
- **Prevents infinite loops** of restarts
- **Graceful shutdown** on SIGINT/SIGTERM

## 📊 Output Examples

### Normal Operation

```
🔵 [2025-12-16T...] Starting self-healing dev server...
🔵 [2025-12-16T...] Port: 3005
🔵 [2025-12-16T...] Max restarts: 3
🔵 [2025-12-16T...] Error threshold: 3

🔵 [2025-12-16T...] Starting Next.js dev server on port 3005...
✅ [2025-12-16T...] Server compiled successfully
```

### Auto-Healing in Action

```
❌ [2025-12-16T...] Detected error (1/3): 404 /_next/static/chunks/main-app.js
❌ [2025-12-16T...] Detected error (2/3): Cannot find module '.next/server'
❌ [2025-12-16T...] Detected error (3/3): Invalid hook call
⚠️  [2025-12-16T...] Error threshold exceeded, initiating self-healing restart...
⚠️  [2025-12-16T...] 🔄 Self-healing restart 1/3
🔵 [2025-12-16T...] Cleaning build artifacts...
✅ [2025-12-16T...] Removed .next
✅ [2025-12-16T...] Removed node_modules/.cache
🔵 [2025-12-16T...] Starting Next.js dev server on port 3005...
✅ [2025-12-16T...] Server compiled successfully
```

## 🏥 Health Check Endpoint

The health check endpoint provides detailed server status:

### Start Health Monitor

```bash
npm run dev:health
```

### Check Health

```bash
curl http://localhost:3006/health
```

### Response Format

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

### Unhealthy Response

```json
{
  "healthy": false,
  "timestamp": "2025-12-16T12:00:00.000Z",
  "checks": {
    "nextDirExists": false,
    "mainChunkAccessible": false,
    "devServerResponding": true
  },
  "errors": [
    ".next directory does not exist",
    "Main chunk returned status 404"
  ]
}
```

## 🛠️ Configuration

### Environment Variables

```bash
# Dev server port
PORT=3005

# Health check endpoint port
HEALTH_PORT=3006
```

### Tuning Parameters

Edit `scripts/self-healing-dev.ts`:

```typescript
const MAX_RESTARTS = 3;              // Max restart attempts
const HEALTH_CHECK_INTERVAL = 10000; // Health check frequency (ms)
const ERROR_THRESHOLD = 3;           // Errors before restart
```

## 📁 Files

### Main Scripts

- **`scripts/self-healing-dev.ts`**
  - Main self-healing wrapper
  - Monitors output and manages restarts
  - Handles cleanup and recovery

- **`scripts/health-check-endpoint.ts`**
  - HTTP health check endpoint
  - Tests server responsiveness
  - Validates chunk accessibility

- **`scripts/auto-fix-404.sh`**
  - Manual fix script
  - One-time cleanup and restart
  - Bash-based for simplicity

### Package.json Scripts

```json
{
  "scripts": {
    "dev:self-heal": "tsx scripts/self-healing-dev.ts",
    "dev:self-heal:3000": "PORT=3000 tsx scripts/self-healing-dev.ts",
    "dev:self-heal:3005": "PORT=3005 tsx scripts/self-healing-dev.ts",
    "dev:health": "tsx scripts/health-check-endpoint.ts",
    "dev:fix": "bash scripts/auto-fix-404.sh"
  }
}
```

## 🎓 Usage Scenarios

### Scenario 1: Daily Development

**Problem**: You want to avoid manual intervention when issues occur.

**Solution**:
```bash
npm run dev:self-heal:3005
```

Just start your day with the self-healing server and let it handle issues automatically.

### Scenario 2: After Git Branch Switch

**Problem**: Switching branches often corrupts the build.

**Solution**:
```bash
npm run dev:fix
```

Quick one-time fix after switching branches.

### Scenario 3: CI/CD or Automated Testing

**Problem**: Need to ensure dev server stays healthy during long-running tests.

**Solution**:
```bash
# Terminal 1: Start self-healing server
npm run dev:self-heal:3005

# Terminal 2: Monitor health
npm run dev:health

# Terminal 3: Run tests
npm run test:e2e
```

### Scenario 4: Debugging Build Issues

**Problem**: Need to understand what's failing.

**Solution**:
```bash
# Check health status
curl http://localhost:3006/health | jq

# Review self-healing logs
npm run dev:self-heal:3005
# Watch for error patterns and restart behavior
```

## 🔍 Troubleshooting

### Server Won't Start

**Symptom**: Self-healing server fails to start

**Check**:
```bash
# Is port already in use?
lsof -i :3005

# Kill stuck process
lsof -ti:3005 | xargs kill -9
```

### Max Restarts Exceeded

**Symptom**: "Max restart attempts reached, giving up"

**Cause**: Persistent issue that cleaning doesn't fix

**Solution**:
```bash
# Nuclear option - full reset
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules
npm install
npm run dev:self-heal:3005
```

### Health Check Fails

**Symptom**: Health endpoint returns unhealthy status

**Check**:
```bash
# Is dev server actually running?
curl http://localhost:3005

# Check .next directory
ls -la .next

# Manual fix
npm run dev:fix
```

### Too Many Open Files

**Symptom**: EMFILE errors in output

**Solution**:
```bash
# Increase file descriptor limit
ulimit -n 10240

# Make permanent (add to ~/.zshrc)
echo "ulimit -n 10240" >> ~/.zshrc
```

## 🆚 Comparison: Self-Healing vs Traditional

### Traditional Dev Server

```bash
npm run dev
```

**Pros:**
- Simple, standard approach
- No wrapper overhead

**Cons:**
- ❌ Manual intervention required for issues
- ❌ No automatic recovery
- ❌ Downtime during fixes
- ❌ Requires developer attention

### Self-Healing Dev Server

```bash
npm run dev:self-heal:3005
```

**Pros:**
- ✅ Automatic issue detection
- ✅ Self-recovery without intervention
- ✅ Minimal downtime
- ✅ Continuous monitoring
- ✅ Health metrics

**Cons:**
- Slight overhead for monitoring
- May restart when you don't want it to (rare)

## 🚦 Best Practices

### 1. Use Self-Healing by Default

Make it your default dev command:

```bash
# Add to your shell profile
alias dev="npm run dev:self-heal:3005"
```

### 2. Monitor Health in Production-Like Environments

For staging or demo environments:

```bash
# Start with health monitoring
npm run dev:self-heal:3005 &
npm run dev:health &
```

### 3. Clean Start After Major Changes

After updating dependencies or switching branches:

```bash
npm run dev:fix
```

### 4. Increase File Limits

Prevent EMFILE errors:

```bash
ulimit -n 10240
```

### 5. Review Logs Periodically

Check if auto-restarts are happening frequently:

- If yes: Investigate root cause
- If no: System is healthy

## 📈 Metrics and Monitoring

The self-healing server tracks:

- **Error count**: Errors since last successful compilation
- **Restart count**: Number of restarts in current session
- **Last error**: Most recent error message
- **Health status**: Current server health
- **Timestamps**: When errors and restarts occurred

These metrics help you understand:
- How often issues occur
- Whether the self-healing is working
- If there's a deeper problem to investigate

## 🎯 When to Use Each Tool

| Tool | Use Case |
|------|----------|
| `npm run dev:self-heal:3005` | Daily development, long sessions |
| `npm run dev:fix` | Quick fix after branch switch |
| `npm run dev:health` | Monitoring, CI/CD, staging |
| `npm run dev:clean` | Manual clean start |
| `npm run dev` | Traditional, when you want full control |

## 🔮 Future Enhancements

Potential improvements:

1. **Metrics Dashboard**: Web UI for health metrics
2. **Slack/Discord Notifications**: Alert on restarts
3. **Smart Thresholds**: Adjust based on error patterns
4. **Dependency Change Detection**: Auto-restart on package.json changes
5. **Performance Monitoring**: Track compilation times
6. **Log Aggregation**: Better error analysis

## 📝 Summary

The self-healing dev server provides:

- ✅ **Automatic recovery** from common Next.js dev issues
- ✅ **Zero manual intervention** for 404s and build corruption
- ✅ **Continuous monitoring** with health checks
- ✅ **Intelligent restart logic** with safety limits
- ✅ **Better developer experience** - focus on coding, not fixing

**Recommendation**: Use `npm run dev:self-heal:3005` as your default dev command.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the health check endpoint
3. Try the manual fix: `npm run dev:fix`
4. As a last resort: Full reset with `rm -rf node_modules && npm install`

The self-healing server is designed to handle 99% of common issues automatically. If it's restarting frequently, there may be a deeper problem worth investigating.


