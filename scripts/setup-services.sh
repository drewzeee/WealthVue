#!/bin/bash

# WealthVue Systemd Service Setup Script
# This script must be run with sudo or as root.

set -e

PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"
SYSTEMD_PATH="/etc/systemd/system"
USER_NAME="${USER_NAME:-$(whoami)}"

echo "🚀 Starting WealthVue service setup..."

# 1. Build the application
echo "📦 Building the application..."
sudo -u $USER_NAME -i bash -c "cd $PROJECT_ROOT && npm install && npm run build"

# 2. Run database migrations
echo "🗄️ Running database migrations..."
sudo -u $USER_NAME -i bash -c "cd $PROJECT_ROOT && npx prisma migrate deploy"

# 3. Copy service files
echo "📄 Copying systemd service files..."
cp $PROJECT_ROOT/systemd/wealthvue.service $SYSTEMD_PATH/
cp $PROJECT_ROOT/systemd/wealthvue-worker.service $SYSTEMD_PATH/

# 4. Create log directory (optional but recommended)
# mkdir -p /var/log/wealthvue
# chown $USER_NAME:$USER_NAME /var/log/wealthvue

# 5. Reload systemd and enable services
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload

echo "⚡ Enabling and starting services..."
systemctl enable wealthvue.service
systemctl enable wealthvue-worker.service

systemctl restart wealthvue.service
systemctl restart wealthvue-worker.service

echo "✅ Setup complete!"
echo "Check status with:"
echo "  systemctl status wealthvue"
echo "  systemctl status wealthvue-worker"
echo "View logs with:"
echo "  journalctl -u wealthvue -f"
echo "  journalctl -u wealthvue-worker -f"
