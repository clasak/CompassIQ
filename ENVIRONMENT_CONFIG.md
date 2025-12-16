# Environment Configuration Guide

## Overview

This document provides comprehensive guidance on configuring environment variables for CompassIQ across different environments (development, staging, production).

**Last Updated**: December 16, 2025  
**Version**: 1.0

---

## Environment Variables by Category

### 1. Supabase Configuration (Required)

#### NEXT_PUBLIC_SUPABASE_URL
- **Type**: Public
- **Required**: Yes
- **Format**: `https://[project-ref].supabase.co`
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Description**: Your Supabase project URL
- **Where to Find**: Supabase Dashboard → Settings → API → Project URL

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Type**: Public
- **Required**: Yes
- **Format**: Long JWT token (starts with `eyJ`)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Description**: Supabase anonymous/public API key
- **Where to Find**: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- **Security**: Safe to expose to client (limited permissions)

#### SUPABASE_SERVICE_ROLE_KEY
- **Type**: Secret
- **Required**: Yes (for server-side operations)
- **Format**: Long JWT token (starts with `eyJ`)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Description**: Supabase service role key with admin privileges
- **Where to Find**: Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
- **Security**: ⚠️ **NEVER expose to client** - Server-side only
- **Usage**: Seed scripts, admin operations, bypassing RLS

---

### 2. Application Configuration (Required)

#### APP_BASE_URL
- **Type**: Public
- **Required**: Yes
- **Format**: Full URL with protocol
- **Examples**:
  - Development: `http://localhost:3005`
  - Production: `https://your-app.vercel.app`
- **Description**: Base URL for the application
- **Usage**: Email links, redirects, absolute URLs

#### NODE_ENV
- **Type**: System
- **Required**: Auto-set by platform
- **Values**: `development` | `production` | `test`
- **Description**: Node.js environment mode
- **Usage**: Conditional logic, feature flags

---

### 3. Build Configuration (Optional)

#### NEXT_PUBLIC_BUILD_ID
- **Type**: Public
- **Required**: No
- **Format**: Version string or build number
- **Example**: `v1.0.0` or `2025-12-16-001`
- **Description**: Build identifier for debugging
- **Usage**: Displayed in build badge (dev mode)

#### PORT
- **Type**: Server
- **Required**: No (defaults to 3000)
- **Format**: Number
- **Example**: `3005`
- **Description**: Port for development server
- **Usage**: Local development only

---

### 4. Feature Flags (Optional)

#### NEXT_PUBLIC_ENABLE_DEMO_MODE
- **Type**: Public
- **Required**: No
- **Default**: `true`
- **Values**: `true` | `false`
- **Description**: Enable/disable demo organization features
- **Usage**: Toggle demo mode functionality

#### NEXT_PUBLIC_ENABLE_CONSTRUCTION
- **Type**: Public
- **Required**: No
- **Default**: `true`
- **Values**: `true` | `false`
- **Description**: Enable/disable construction vertical features
- **Usage**: Feature flag for construction module

---

### 5. Analytics & Monitoring (Optional)

#### NEXT_PUBLIC_GA_ID
- **Type**: Public
- **Required**: No
- **Format**: `G-XXXXXXXXXX` or `UA-XXXXXXXXX-X`
- **Example**: `G-ABC123DEF456`
- **Description**: Google Analytics tracking ID
- **Usage**: User behavior tracking

#### SENTRY_DSN
- **Type**: Secret
- **Required**: No
- **Format**: `https://[key]@[org].ingest.sentry.io/[project]`
- **Description**: Sentry error tracking DSN
- **Usage**: Error monitoring and reporting

#### VERCEL_ANALYTICS_ID
- **Type**: Secret
- **Required**: No (auto-set by Vercel)
- **Description**: Vercel Analytics identifier
- **Usage**: Performance monitoring

---

## Environment-Specific Configurations

### Development (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[dev-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...dev-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...dev-service-key...

# Application
APP_BASE_URL=http://localhost:3005
NODE_ENV=development

# Build
NEXT_PUBLIC_BUILD_ID=dev
PORT=3005

# Feature Flags
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_CONSTRUCTION=true
```

**Notes:**
- Use separate Supabase project for development
- Service role key needed for seed scripts
- Port 3005 for consistency

---

### Staging (.env.staging or Vercel Environment)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[staging-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...staging-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...staging-service-key...

# Application
APP_BASE_URL=https://staging-compassiq.vercel.app
NODE_ENV=production

# Build
NEXT_PUBLIC_BUILD_ID=staging-v1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_CONSTRUCTION=true

# Analytics
NEXT_PUBLIC_GA_ID=G-STAGING123
SENTRY_DSN=https://...staging-sentry...
```

**Notes:**
- Separate Supabase project for staging
- Production-like configuration
- Analytics for testing

---

### Production (Vercel Environment Variables)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...prod-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...prod-service-key...

# Application
APP_BASE_URL=https://compassiq.vercel.app
NODE_ENV=production

# Build
NEXT_PUBLIC_BUILD_ID=v1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_CONSTRUCTION=true

# Analytics
NEXT_PUBLIC_GA_ID=G-PROD123456
SENTRY_DSN=https://...prod-sentry...
```

**Notes:**
- Production Supabase project
- Real domain name
- Full analytics enabled
- Service role key for seed script only

---

## Configuration Checklist

### Pre-Deployment Verification

#### Supabase Configuration ✅
- [ ] Supabase project created
- [ ] Database migrations applied (all 15)
- [ ] RLS policies enabled
- [ ] Auth providers configured
- [ ] Service role key secured
- [ ] Anon key copied
- [ ] Project URL noted

#### Environment Variables ✅
- [ ] All required variables set
- [ ] No placeholder values
- [ ] Keys match environment (dev/staging/prod)
- [ ] Service role key not exposed to client
- [ ] APP_BASE_URL matches deployment URL

#### Vercel Configuration ✅
- [ ] Environment variables added to Vercel
- [ ] Variables scoped correctly (Production/Preview/Development)
- [ ] Sensitive keys marked as secret
- [ ] Build settings configured
- [ ] Domain configured (if custom)

#### Security Verification ✅
- [ ] Service role key never in client code
- [ ] Service role key never in git
- [ ] .env.local in .gitignore
- [ ] No hardcoded credentials
- [ ] HTTPS enforced in production

---

## Troubleshooting

### Common Issues

#### 1. "Invalid API key" Error
**Symptoms**: Authentication fails, 401 errors
**Causes**:
- Wrong anon key
- Key from different project
- Key expired or rotated

**Solutions**:
```bash
# Verify key in Supabase Dashboard
# Copy fresh key from Settings → API
# Update .env.local or Vercel environment variables
# Restart dev server or redeploy
```

#### 2. "Service role required" Error
**Symptoms**: Seed script fails, admin operations fail
**Causes**:
- Service role key missing
- Service role key incorrect
- Using anon key instead

**Solutions**:
```bash
# Verify SUPABASE_SERVICE_ROLE_KEY is set
# Check key starts with correct prefix
# Ensure key is from correct project
# Never use service role key in client code
```

#### 3. "Invalid redirect URL" Error
**Symptoms**: Auth redirects fail
**Causes**:
- APP_BASE_URL incorrect
- Redirect URL not whitelisted in Supabase

**Solutions**:
```bash
# Check APP_BASE_URL matches deployment
# Add URL to Supabase Auth settings:
# Dashboard → Authentication → URL Configuration
# Add: http://localhost:3005/** (dev)
# Add: https://your-app.vercel.app/** (prod)
```

#### 4. Environment Variables Not Loading
**Symptoms**: Variables undefined, features broken
**Causes**:
- File not named correctly (.env.local)
- Variables not prefixed with NEXT_PUBLIC_ (for client)
- Server not restarted after changes

**Solutions**:
```bash
# Client variables must start with NEXT_PUBLIC_
# Restart dev server: npm run dev
# Redeploy on Vercel for production changes
# Check Vercel logs for missing variables
```

---

## Security Best Practices

### 1. Key Management
- ✅ Use separate keys for each environment
- ✅ Rotate keys periodically (quarterly)
- ✅ Never commit keys to git
- ✅ Use environment-specific .env files
- ✅ Store production keys in secure vault

### 2. Access Control
- ✅ Limit who has access to service role key
- ✅ Use least privilege principle
- ✅ Monitor key usage
- ✅ Revoke compromised keys immediately

### 3. Client vs Server
- ✅ Only expose necessary variables to client
- ✅ Prefix client variables with NEXT_PUBLIC_
- ✅ Keep service role key server-side only
- ✅ Never log sensitive keys

### 4. Monitoring
- ✅ Monitor failed auth attempts
- ✅ Track API usage
- ✅ Alert on unusual patterns
- ✅ Review access logs regularly

---

## Environment Variable Template

### .env.example (Commit to Git)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
APP_BASE_URL=http://localhost:3005
NODE_ENV=development

# Build Configuration (Optional)
NEXT_PUBLIC_BUILD_ID=dev
PORT=3005

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_CONSTRUCTION=true

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
SENTRY_DSN=your_sentry_dsn
```

### .env.local (Never Commit)
```env
# Copy .env.example to .env.local
# Fill in actual values
# This file is gitignored
```

---

## Verification Steps

### 1. Local Development
```bash
# Create .env.local from .env.example
cp .env.example .env.local

# Edit .env.local with real values
# Start dev server
PORT=3005 npm run dev

# Verify in browser
# Check build badge shows correct port
# Test authentication
# Verify database connections
```

### 2. Vercel Deployment
```bash
# Add environment variables in Vercel Dashboard
# Settings → Environment Variables

# Deploy
vercel deploy

# Verify deployment
# Check environment variables loaded
# Test authentication
# Verify database connections
```

### 3. Post-Deployment
```bash
# Test all critical paths
# Verify auth works
# Check database operations
# Monitor error logs
# Review analytics
```

---

## Migration Guide

### From Development to Production

1. **Create Production Supabase Project**
   ```bash
   # Don't use dev project for production
   # Create new project in Supabase
   # Note new URL and keys
   ```

2. **Apply Migrations**
   ```bash
   # Run all migrations in order
   # Verify RLS policies
   # Test with sample data
   ```

3. **Update Environment Variables**
   ```bash
   # In Vercel Dashboard
   # Replace dev keys with prod keys
   # Update APP_BASE_URL
   # Set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   # Push to main branch
   # Vercel auto-deploys
   # Monitor deployment logs
   ```

5. **Verify**
   ```bash
   # Test authentication
   # Create test org
   # Verify all features
   # Check error logs
   ```

---

## Appendix

### A. Environment Variable Naming Conventions
- `NEXT_PUBLIC_*` - Client-side accessible
- `SUPABASE_*` - Supabase-related
- `APP_*` - Application-specific
- `*_URL` - URLs
- `*_KEY` - API keys
- `*_ID` - Identifiers
- `*_DSN` - Data Source Names

### B. Supabase Project Setup
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Enter project name
5. Generate strong database password
6. Select region (closest to users)
7. Choose plan (Free tier works for dev)
8. Wait for project creation (~2 minutes)

### C. Vercel Environment Variable Scopes
- **Production**: Used for production deployments
- **Preview**: Used for preview deployments (PRs)
- **Development**: Used for local development (via `vercel dev`)

### D. Key Rotation Procedure
1. Generate new key in Supabase
2. Update environment variables
3. Test with new key
4. Deploy/restart services
5. Revoke old key
6. Monitor for issues

---

**Document Version**: 1.0  
**Last Updated**: December 16, 2025  
**Next Review**: After production deployment  
**Status**: ✅ Ready for Use
