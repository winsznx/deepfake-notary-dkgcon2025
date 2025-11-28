#!/bin/bash

# Alternative approach: Override build commands using environment variables
# This forces Railway to cd into backend directory before building

echo "Setting Nixpacks build commands to force backend directory..."

railway variables --set "NIXPACKS_BUILD_CMD=cd backend && rm -rf node_modules package-lock.json && npm install --legacy-peer-deps --no-save && npx prisma generate && npm run build"

railway variables --set "NIXPACKS_START_CMD=cd backend && npx prisma db push && npm start"

railway variables --set "NIXPACKS_PKGS=nodejs_18 openssl"

echo ""
echo "✅ Build commands configured!"
echo ""
echo "This forces Railway to:"
echo "1. Change into backend directory before building"
echo "2. Use the backend package.json"
echo "3. Run commands from the correct location"
echo ""
echo "Railway will automatically redeploy."
echo ""
echo "Check deployment at: https://railway.app/project/fded58b8-d211-439b-8b3a-d7cf9ea4010c"
