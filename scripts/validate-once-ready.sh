#!/bin/bash
# Auto-validation script that runs once Supabase credentials are detected

cd "$(dirname "$0")/.."

echo "Waiting for Supabase credentials in .env.local..."
while true; do
  if awk -F'=' '/^NEXT_PUBLIC_SUPABASE_URL=/ {url=length($2)>10} /^NEXT_PUBLIC_SUPABASE_ANON_KEY=/ {key=length($2)>10} /^SUPABASE_SERVICE_ROLE_KEY=/ {svc=length($2)>10} END {if (url && key && svc) exit 0; else exit 1}' .env.local 2>/dev/null; then
    echo "✅ Credentials detected! Proceeding with validation..."
    break
  fi
  sleep 2
done

# Continue with validation steps...
echo "Starting validation process..."

