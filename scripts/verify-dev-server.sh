#!/bin/bash

# Verify that Next.js dev server is running and chunk files are available
PORT=${1:-3000}
BASE_URL="http://localhost:${PORT}"

echo "Checking dev server on port ${PORT}..."

# Check if server is responding
if ! curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}" | grep -q "200\|301\|302"; then
  echo "❌ Dev server is not responding on port ${PORT}"
  echo "   Run: npm run dev"
  exit 1
fi

echo "✅ Dev server is running"

# Check for required chunk files
CHUNKS=("main-app.js" "app-pages-internals.js" "webpack.js")

for chunk in "${CHUNKS[@]}"; do
  URL="${BASE_URL}/_next/static/chunks/${chunk}"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${URL}")
  
  if [ "$STATUS" = "200" ]; then
    echo "✅ ${chunk} is available"
  else
    echo "❌ ${chunk} returned status ${STATUS}"
    echo "   URL: ${URL}"
    echo "   The dev server may need to finish compiling. Wait a few seconds and refresh."
    exit 1
  fi
done

echo ""
echo "✅ All chunk files are available. Dev server is ready!"
