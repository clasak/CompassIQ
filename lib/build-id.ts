/**
 * Build ID generation for dev/prod
 * In dev: uses package.json version + timestamp
 * In prod: uses NEXT_PUBLIC_BUILD_ID env var or falls back to version
 */

export function getBuildId(): string {
  if (typeof window === 'undefined') {
    // Server-side
    const envBuildId = process.env.NEXT_PUBLIC_BUILD_ID
    if (envBuildId) return envBuildId
    
    // Fallback: use package.json version + timestamp
    const version = process.env.npm_package_version || '0.1.0'
    const timestamp = Date.now()
    return `${version}-${timestamp}`
  } else {
    // Client-side: read from window or generate
    const envBuildId = process.env.NEXT_PUBLIC_BUILD_ID
    if (envBuildId) return envBuildId
    
    // Fallback: use version from package.json if available
    const version = '0.1.0' // Default fallback
    return `${version}-dev`
  }
}

export function getPort(): string {
  if (typeof window === 'undefined') {
    return process.env.PORT || '3000'
  }
  return window.location.port || (window.location.protocol === 'https:' ? '443' : '80')
}


