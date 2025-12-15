import { createServiceRoleClient } from '../lib/supabase/service-role'

async function testConnection() {
  try {
    const supabase = createServiceRoleClient()
    
    // Simple health check query
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Supabase connection successful!')
    process.exit(0)
  } catch (err: any) {
    console.error('❌ Connection error:', err.message)
    if (err.message.includes('Missing') || err.message.includes('undefined')) {
      console.error('Missing Supabase environment variables')
    }
    process.exit(1)
  }
}

testConnection()

