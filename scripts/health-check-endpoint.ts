#!/usr/bin/env tsx

/**
 * Health Check Endpoint for Next.js Dev Server
 * 
 * This script provides a health check endpoint that can be used to monitor
 * the dev server and detect issues before they cause problems.
 */

import http from 'http';
import { existsSync } from 'fs';
import { join } from 'path';

const PORT = process.env.HEALTH_PORT || '3006';

interface HealthStatus {
  healthy: boolean;
  timestamp: string;
  checks: {
    nextDirExists: boolean;
    mainChunkAccessible: boolean;
    devServerResponding: boolean;
  };
  errors: string[];
}

async function checkDevServerHealth(): Promise<HealthStatus> {
  const errors: string[] = [];
  const checks = {
    nextDirExists: false,
    mainChunkAccessible: false,
    devServerResponding: false,
  };

  // Check if .next directory exists
  const nextDir = join(process.cwd(), '.next');
  checks.nextDirExists = existsSync(nextDir);
  if (!checks.nextDirExists) {
    errors.push('.next directory does not exist');
  }

  // Check if dev server is responding
  const devPort = process.env.PORT || '3005';
  try {
    const response = await fetch(`http://localhost:${devPort}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    checks.devServerResponding = response.ok;
    if (!response.ok) {
      errors.push(`Dev server returned status ${response.status}`);
    }
  } catch (error) {
    errors.push(`Dev server not responding: ${error}`);
  }

  // Check if main chunk is accessible
  try {
    const chunkResponse = await fetch(`http://localhost:${devPort}/_next/static/chunks/main-app.js`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    checks.mainChunkAccessible = chunkResponse.ok;
    if (!chunkResponse.ok) {
      errors.push(`Main chunk returned status ${chunkResponse.status}`);
    }
  } catch (error) {
    errors.push(`Main chunk not accessible: ${error}`);
  }

  const healthy = checks.nextDirExists && checks.mainChunkAccessible && checks.devServerResponding;

  return {
    healthy,
    timestamp: new Date().toISOString(),
    checks,
    errors,
  };
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health' || req.url === '/') {
    try {
      const health = await checkDevServerHealth();
      
      res.writeHead(health.healthy ? 200 : 503, {
        'Content-Type': 'application/json',
      });
      
      res.end(JSON.stringify(health, null, 2));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        healthy: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      }));
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(parseInt(PORT), () => {
  console.log(`✅ Health check endpoint running on http://localhost:${PORT}/health`);
  console.log(`   Monitoring dev server on port ${process.env.PORT || '3005'}`);
});


