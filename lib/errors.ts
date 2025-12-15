/**
 * Normalize Supabase/Postgres errors into user-friendly messages
 */
export function normalizeError(error: any): string {
  if (!error) {
    return 'An unexpected error occurred'
  }

  // Supabase error
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return 'This record already exists. Please use a different value.'
      case '23503': // Foreign key violation
        return 'Cannot delete this record because it is referenced by other records.'
      case '23502': // Not null violation
        return 'Required fields are missing.'
      case 'P0001': // Custom exception
        return error.message || 'Operation failed'
      case '42501': // Insufficient privilege
        return 'You do not have permission to perform this action.'
      case 'PGRST116': // No rows returned
        return 'Record not found.'
      default:
        return error.message || `Error: ${error.code}`
    }
  }

  // Error with message
  if (error.message) {
    return error.message
  }

  // String error
  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

/**
 * Check if error is a demo org write attempt
 */
export function isDemoOrgError(error: any): boolean {
  if (!error) return false
  const message = error.message?.toLowerCase() || ''
  return (
    message.includes('demo') ||
    message.includes('read-only') ||
    error.code === '42501' // Insufficient privilege (RLS blocking demo write)
  )
}


