#!/usr/bin/env tsx

/**
 * Self-Healing Next.js Dev Server
 * 
 * This script wraps the Next.js dev server and automatically detects and fixes:
 * - 404 errors for chunk files
 * - React Hook errors
 * - Corrupted .next directory
 * - Missing module errors
 * 
 * It monitors the server output and automatically restarts with a clean build
 * when problems are detected.
 */

import { spawn, ChildProcess } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import http from 'http';

const PORT = process.env.PORT || '3005';
const MAX_RESTARTS = 3;
const HEALTH_CHECK_INTERVAL = 10000; // 10 seconds
const ERROR_THRESHOLD = 3; // Number of errors before auto-restart

interface HealthMetrics {
  errorCount: number;
  lastError: string | null;
  lastErrorTime: number | null;
  restartCount: number;
  isHealthy: boolean;
}

class SelfHealingDevServer {
  private devProcess: ChildProcess | null = null;
  private healthMetrics: HealthMetrics = {
    errorCount: 0,
    lastError: null,
    lastErrorTime: null,
    restartCount: 0,
    isHealthy: true,
  };
  private healthCheckTimer: NodeJS.Timeout | null = null;

  // Patterns that indicate the server needs to be restarted
  private readonly ERROR_PATTERNS = [
    /404.*\/_next\/static\/chunks/i,
    /Cannot find module.*\.next/i,
    /Invalid hook call/i,
    /Cannot read properties of null.*useContext/i,
    /webpack.*undefined/i,
    /ENOENT.*\.next/i,
    /Module not found.*\.next/i,
  ];

  // Patterns that indicate successful compilation
  private readonly SUCCESS_PATTERNS = [
    /✓ Ready in/i,
    /✓ Compiled/i,
  ];

  constructor() {
    this.setupSignalHandlers();
  }

  private setupSignalHandlers(): void {
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
  }

  private log(message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔵',
      warn: '⚠️ ',
      error: '❌',
      success: '✅',
    }[type];

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  private async cleanBuildArtifacts(): Promise<void> {
    this.log('Cleaning build artifacts...', 'info');

    const pathsToClean = [
      join(process.cwd(), '.next'),
      join(process.cwd(), 'node_modules', '.cache'),
    ];

    for (const path of pathsToClean) {
      if (existsSync(path)) {
        try {
          rmSync(path, { recursive: true, force: true });
          this.log(`Removed ${path}`, 'success');
        } catch (error) {
          this.log(`Failed to remove ${path}: ${error}`, 'error');
        }
      }
    }

    // Wait a moment for filesystem to settle
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async killExistingProcess(): Promise<void> {
    try {
      const { execSync } = require('child_process');
      const result = execSync(`lsof -ti:${PORT}`, { encoding: 'utf-8' }).trim();
      
      if (result) {
        this.log(`Killing existing process on port ${PORT}...`, 'warn');
        execSync(`kill -9 ${result}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      // No process found, which is fine
    }
  }

  private isErrorLine(line: string): boolean {
    return this.ERROR_PATTERNS.some(pattern => pattern.test(line));
  }

  private isSuccessLine(line: string): boolean {
    return this.SUCCESS_PATTERNS.some(pattern => pattern.test(line));
  }

  private handleOutput(data: Buffer): void {
    const output = data.toString();
    const lines = output.split('\n').filter(line => line.trim());

    for (const line of lines) {
      // Check for errors
      if (this.isErrorLine(line)) {
        this.healthMetrics.errorCount++;
        this.healthMetrics.lastError = line;
        this.healthMetrics.lastErrorTime = Date.now();
        this.healthMetrics.isHealthy = false;

        this.log(`Detected error (${this.healthMetrics.errorCount}/${ERROR_THRESHOLD}): ${line}`, 'error');

        // Auto-restart if threshold exceeded
        if (this.healthMetrics.errorCount >= ERROR_THRESHOLD) {
          this.log('Error threshold exceeded, initiating self-healing restart...', 'warn');
          this.restart();
        }
      }

      // Check for success
      if (this.isSuccessLine(line)) {
        this.healthMetrics.isHealthy = true;
        this.healthMetrics.errorCount = 0;
        this.log('Server compiled successfully', 'success');
      }

      // Forward output
      console.log(line);
    }
  }

  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, HEALTH_CHECK_INTERVAL);
  }

  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  private async checkHttp404(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: PORT,
        path: path,
        method: 'HEAD',
      };

      const req = http.request(options, (res) => {
        resolve(res.statusCode === 404);
      });

      req.setTimeout(3000, () => {
        req.destroy();
        resolve(false);
      });

      req.on('error', (error: any) => {
        // Ignore connection errors (server might be starting)
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          resolve(false);
        } else {
          resolve(false);
        }
      });

      req.end();
    });
  }

  private async performHealthCheck(): Promise<void> {
    // Check if .next directory exists
    const nextDir = join(process.cwd(), '.next');
    if (!existsSync(nextDir)) {
      this.log('.next directory missing, restarting...', 'warn');
      this.restart();
      return;
    }

    // Check if errors occurred recently (within last 30 seconds)
    if (this.healthMetrics.lastErrorTime) {
      const timeSinceError = Date.now() - this.healthMetrics.lastErrorTime;
      if (timeSinceError < 30000 && !this.healthMetrics.isHealthy) {
        this.log('Server unhealthy, initiating restart...', 'warn');
        this.restart();
      }
    }

    // NEW: Check actual HTTP requests for 404s
    try {
      const testUrls = [
        `/_next/static/chunks/main-app.js`,
        `/_next/static/chunks/app-pages-internals.js`,
      ];

      for (const path of testUrls) {
        const has404 = await this.checkHttp404(path);
        if (has404) {
          this.healthMetrics.errorCount++;
          this.healthMetrics.lastError = `404 detected: ${path}`;
          this.healthMetrics.lastErrorTime = Date.now();
          this.healthMetrics.isHealthy = false;

          this.log(`HTTP 404 detected (${this.healthMetrics.errorCount}/${ERROR_THRESHOLD}): ${path}`, 'error');

          if (this.healthMetrics.errorCount >= ERROR_THRESHOLD) {
            this.log('HTTP 404 threshold exceeded, initiating self-healing restart...', 'warn');
            this.restart();
            return;
          }
        } else {
          // Reset error count on successful response
          if (this.healthMetrics.errorCount > 0) {
            this.log(`HTTP check passed for ${path}, resetting error count`, 'success');
            this.healthMetrics.errorCount = 0;
            this.healthMetrics.isHealthy = true;
          }
        }
      }
    } catch (error: any) {
      // Ignore health check errors (server might be starting)
      if (!error.message?.includes('ECONNREFUSED')) {
        this.log(`Health check failed: ${error.message}`, 'warn');
      }
    }
  }

  private async startDevServer(): Promise<void> {
    this.log(`Starting Next.js dev server on port ${PORT}...`, 'info');

    const env = {
      ...process.env,
      PORT,
      NODE_ENV: 'development',
    };

    this.devProcess = spawn('npx', ['next', 'dev'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env,
      shell: true,
    });

    if (this.devProcess.stdout) {
      this.devProcess.stdout.on('data', (data) => this.handleOutput(data));
    }

    if (this.devProcess.stderr) {
      this.devProcess.stderr.on('data', (data) => this.handleOutput(data));
    }

    this.devProcess.on('exit', (code, signal) => {
      this.log(`Dev server exited with code ${code} and signal ${signal}`, 'warn');
      
      if (code !== 0 && this.healthMetrics.restartCount < MAX_RESTARTS) {
        this.log('Unexpected exit, attempting restart...', 'warn');
        this.restart();
      } else if (this.healthMetrics.restartCount >= MAX_RESTARTS) {
        this.log('Max restart attempts reached, giving up', 'error');
        process.exit(1);
      }
    });

    this.startHealthCheck();
  }

  private async stopDevServer(): Promise<void> {
    if (this.devProcess) {
      this.log('Stopping dev server...', 'info');
      this.stopHealthCheck();
      
      return new Promise((resolve) => {
        if (!this.devProcess) {
          resolve();
          return;
        }

        this.devProcess.once('exit', () => {
          this.devProcess = null;
          resolve();
        });

        this.devProcess.kill('SIGTERM');

        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.devProcess) {
            this.devProcess.kill('SIGKILL');
          }
        }, 5000);
      });
    }
  }

  public async restart(): Promise<void> {
    if (this.healthMetrics.restartCount >= MAX_RESTARTS) {
      this.log(`Max restart attempts (${MAX_RESTARTS}) reached`, 'error');
      process.exit(1);
    }

    this.healthMetrics.restartCount++;
    this.log(`🔄 Self-healing restart ${this.healthMetrics.restartCount}/${MAX_RESTARTS}`, 'warn');

    await this.stopDevServer();
    await this.killExistingProcess();
    await this.cleanBuildArtifacts();

    // Reset error metrics
    this.healthMetrics.errorCount = 0;
    this.healthMetrics.lastError = null;
    this.healthMetrics.lastErrorTime = null;

    await this.startDevServer();
  }

  public async start(): Promise<void> {
    this.log('🚀 Starting self-healing dev server...', 'success');
    this.log(`Port: ${PORT}`, 'info');
    this.log(`Max restarts: ${MAX_RESTARTS}`, 'info');
    this.log(`Error threshold: ${ERROR_THRESHOLD}`, 'info');
    this.log('', 'info');

    // Initial cleanup
    await this.killExistingProcess();
    await this.cleanBuildArtifacts();

    await this.startDevServer();
  }

  private async shutdown(signal: string): Promise<void> {
    this.log(`Received ${signal}, shutting down gracefully...`, 'warn');
    await this.stopDevServer();
    process.exit(0);
  }
}

// Start the self-healing dev server
const server = new SelfHealingDevServer();
server.start().catch((error) => {
  console.error('Failed to start self-healing dev server:', error);
  process.exit(1);
});


