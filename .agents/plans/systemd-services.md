# Systemd Service Implementation Plan

This plan outlines the steps to create and configure systemd services for the WealthVue application and its background worker.

## Proposed Changes

### Systemd Configuration

#### wealthvue.service
A systemd service unit file for the Next.js application.
- **ExecStart**: `npm start`
- **WorkingDirectory**: `/home/andrew/wealthvue`
- **User**: `andrew`
- **EnvironmentFile**: Pointing to the project's `.env` file.
- **Restart**: `always`

#### wealthvue-worker.service
A systemd service unit file for the background job worker.
- **ExecStart**: `npm run worker`
- **WorkingDirectory**: `/home/andrew/wealthvue`
- **User**: `andrew`
- **EnvironmentFile**: Same as the main app.
- **Restart**: `always`

#### setup-services.sh
A helper script to:
- Build the application (`npm run build`).
- Run Prisma migrations (`npx prisma migrate deploy`).
- Copy service files to `/etc/systemd/system/`.
- Reload systemd and start the services.

## Verification Plan

### Manual Verification
1. **Service Status**: Check `systemctl status wealthvue` and `systemctl status wealthvue-worker` to ensure they are active and running.
2. **Logs Verification**: Check `journalctl -u wealthvue -f` and `journalctl -u wealthvue-worker -f` to verify the app and worker are starting correctly without errors.
3. **App Accessibility**: Verify the application is accessible at the configured URL (usually http://localhost:3000).
