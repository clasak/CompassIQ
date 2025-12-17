#!/bin/bash

# Auto-fix 404 Script
# This script can be run manually or triggered automatically to fix 404 issues

set -e

echo "🔧 Auto-fixing Next.js 404 issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PORT=${PORT:-3005}

# Step 1: Kill existing process
echo -e "${YELLOW}Step 1: Checking for existing process on port ${PORT}...${NC}"
if lsof -ti:${PORT} > /dev/null 2>&1; then
  echo -e "${YELLOW}Killing process on port ${PORT}...${NC}"
  lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true
  sleep 1
  echo -e "${GREEN}✓ Process killed${NC}"
else
  echo -e "${GREEN}✓ No process running on port ${PORT}${NC}"
fi

# Step 2: Clean build artifacts
echo -e "${YELLOW}Step 2: Cleaning build artifacts...${NC}"
if [ -d ".next" ]; then
  rm -rf .next
  echo -e "${GREEN}✓ Removed .next directory${NC}"
else
  echo -e "${GREEN}✓ .next directory already clean${NC}"
fi

if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo -e "${GREEN}✓ Removed node_modules/.cache${NC}"
else
  echo -e "${GREEN}✓ Cache already clean${NC}"
fi

# Step 3: Wait for filesystem
echo -e "${YELLOW}Step 3: Waiting for filesystem to settle...${NC}"
sleep 2
echo -e "${GREEN}✓ Ready${NC}"

# Step 4: Start dev server
echo -e "${YELLOW}Step 4: Starting dev server on port ${PORT}...${NC}"
echo -e "${GREEN}✓ Dev server starting...${NC}"
echo ""
echo -e "${GREEN}🚀 Auto-fix complete! Starting Next.js dev server...${NC}"
echo ""

# Start the dev server
PORT=${PORT} npm run dev


