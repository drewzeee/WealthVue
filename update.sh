#!/bin/bash

# WealthVue Update Script
# This script pulls the latest code from GitHub, installs dependencies,
# builds the app, runs migrations, and restarts the systemd services.

set -e

PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"
USER_NAME="${USER_NAME:-$(whoami)}"

echo "🔄 Starting WealthVue update..."

# 1. Pull latest code
echo "📥 Pulling latest changes from GitHub..."
sudo -u $USER_NAME -i bash -c "cd $PROJECT_ROOT && git pull"

# 2. Install dependencies
echo "📦 Installing dependencies..."
sudo -u $USER_NAME -i bash -c "cd $PROJECT_ROOT && npm install"

# 3. Build the application
echo "🏗️ Building the application..."
sudo -u $USER_NAME -i bash -c "cd $PROJECT_ROOT && npm run build"

# 4. Run database migrations
echo "🗄️ Running database migrations..."
sudo -u $USER_NAME -i bash -c "cd $PROJECT_ROOT && npx prisma migrate deploy"

# 5. Restart services
echo "🔄 Restarting systemd services..."
sudo systemctl restart wealthvue.service
sudo systemctl restart wealthvue-worker.service

echo "✅ Update complete!"
echo "App and worker have been updated and restarted."
