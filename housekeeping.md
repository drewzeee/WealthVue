# WealthVue Pre-Release Housekeeping Checklist

> [!IMPORTANT]
> Complete these tasks before making the repository public or releasing to users.

---

## 1. 🔐 Security & Secrets

- [ ] **Remove `.env` from git history** - The `.env` file contains real Plaid API credentials. Run:
  ```bash
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch .env .env.local" \
    --prune-empty --tag-name-filter cat -- --all
  ```
- [ ] **Rotate Plaid credentials** - Current keys in `.env` are exposed in git history
- [ ] **Verify `.gitignore`** - Ensure `.env` and `.env.local` are properly ignored (✅ already done)
- [ ] **Audit `.env.example`** - Confirm it contains only placeholder values (✅ looks good)
- [ ] **Review `NEXTAUTH_SECRET`** - Ensure production uses a unique, generated secret

---

## 2. 👤 Remove Hardcoded User References

The following files contain hardcoded references to `/home/andrew/` and username `andrew`:

### systemd/wealthvue.service
- [ ] Change `User=andrew` → use a placeholder like `User=<YOUR_USER>`
- [ ] Change `WorkingDirectory=/home/andrew/wealthvue` → `/path/to/wealthvue`
- [ ] Change `EnvironmentFile=/home/andrew/wealthvue/.env` → `/path/to/wealthvue/.env`

### systemd/wealthvue-worker.service
- [ ] Same changes as `wealthvue.service`

### scripts/setup-services.sh
- [ ] Line 8: Change `PROJECT_ROOT="/home/andrew/wealthvue"` → configurable variable
- [ ] Line 10: Change `USER_NAME="andrew"` → configurable variable
- [ ] Consider making these CLI arguments or environment variables

### update.sh
- [ ] Line 9: Change `PROJECT_ROOT="/home/andrew/wealthvue"` → configurable variable  
- [ ] Line 10: Change `USER_NAME="andrew"` → configurable variable

---

## 3. 📝 Documentation Updates

### README.md
- [ ] Update "Current Phase" section (line 180) to reflect release status
- [ ] Add proper license information (currently "Private project - All rights reserved")
- [ ] Add screenshots/demo of the application
- [ ] Add detailed Docker deployment instructions (section is currently empty)
- [ ] Consider adding a "Quick Start" section for new users
- [ ] Add troubleshooting section for common issues
- [ ] Update prerequisites to mention external API requirements (Plaid account, etc.)

### GEMINI.md / CLAUDE.md
- [ ] Review if these should be public (AI assistant instructions)
- [ ] Consider moving to `.agents/` or removing for public release

### BRANDING.md
- [ ] Review if this should be public or kept internal

### PRD.md / TASKS.md
- [ ] Decide if these should remain in the public repo or be removed
- [ ] Consider archiving completed task tracking

---

## 4. 🧹 Code Cleanup

### Address TODOs in codebase

#### src/app/api/transactions/route.ts
- [ ] Line 80-81: Implement account ownership verification
  ```typescript
  // TODO: Verify account ownership.
  ```

#### src/components/settings/account-list.tsx  
- [ ] Line 111: Implement balance calculation for accounts
  ```typescript
  balance={0} // TODO: Calculate total value
  ```
- [ ] Line 114: Fix balance handling in edit function

### Remove debug/test scripts from `scripts/`
Evaluate which scripts should remain:
- [ ] `debug-budget-service.ts` - Remove or move to dev tools
- [ ] `debug-transactions.ts` - Remove or move to dev tools
- [ ] `test-*.ts` files - Consider moving to proper test suite or removing
- [ ] `backfill-transaction-dates.ts` - Document or remove if one-time use
- [ ] `migrate-transaction-signs.ts` - Document or remove if one-time use
- [ ] `reprocess-transactions.ts` - Document purpose or remove

---

## 5. 📦 Package & Build Configuration

### package.json
- [ ] Update `version` from `0.1.0` to appropriate release version (e.g., `1.0.0`)
- [ ] Review `private: true` - update if publishing to npm (likely keep as true)
- [ ] Add `repository`, `author`, `bugs`, and `homepage` fields:
  ```json
  {
    "author": "Your Name",
    "repository": {
      "type": "git",
      "url": "https://github.com/yourusername/wealthvue.git"
    },
    "homepage": "https://github.com/yourusername/wealthvue#readme",
    "bugs": {
      "url": "https://github.com/yourusername/wealthvue/issues"
    }
  }
  ```
- [ ] Add `license` field if making it open source

### next.config.js
- [ ] Review configuration for production optimization
- [ ] Ensure no development-only settings are enabled

---

## 6. 🐳 Docker Configuration

### docker-compose.yml
- [ ] Review password `wealthvue_dev_password` - make configurable via env var
- [ ] Add environment variable substitution for secrets:
  ```yaml
  POSTGRES_PASSWORD: ${DB_PASSWORD:-wealthvue_dev_password}
  ```

### docker-compose.dev.yml
- [ ] Confirm this is for development only and documented as such

### Dockerfile
- [ ] Review for production readiness
- [ ] Ensure multi-stage build is optimized
- [ ] Add health checks if not present

---

## 7. 🗄️ Database

- [ ] Remove seed data that contains personal information (if any)
- [ ] Review `prisma/seed.ts` for sensitive data
- [ ] Document migration steps clearly for new installations
- [ ] Consider adding a database reset script for development

---

## 8. 🌐 External Services

- [ ] Document Plaid account setup requirements
- [ ] Document CoinGecko API key requirements (optional)
- [ ] Add rate limiting documentation for external APIs
- [ ] Consider adding links to external service documentation

---

## 9. 🔍 Final Verification

### Pre-release testing
- [ ] Fresh clone and setup test (follow README exactly)
- [ ] Verify all environment variables are documented
- [ ] Test Docker deployment from scratch
- [ ] Test systemd deployment from scratch
- [ ] Run full lint: `npm run lint`
- [ ] Run type check: `npm run type-check`
- [ ] Run build: `npm run build`

### Repository hygiene
- [ ] Review git history for accidentally committed secrets
- [ ] Add CONTRIBUTING.md if accepting contributions
- [ ] Add CODE_OF_CONDUCT.md if making public
- [ ] Add issue/PR templates in `.github/` directory
- [ ] Configure GitHub repository settings (description, topics, etc.)

---

## 10. 🚀 Release Checklist

- [ ] Create a release branch or tag
- [ ] Update CHANGELOG.md (create if doesn't exist)
- [ ] Write release notes
- [ ] Decide on versioning strategy (semver)
- [ ] Set up GitHub Actions for CI/CD (optional)
- [ ] Configure Dependabot for security updates (optional)

---

## Notes

### Files to review before public release:
| File | Status | Notes |
|------|--------|-------|
| `.env` | ⚠️ Critical | Contains real credentials, must not be committed |
| `.env.example` | ✅ Good | Contains placeholders only |
| `systemd/*.service` | 🔧 Needs update | Hardcoded paths |
| `scripts/*.sh` | 🔧 Needs update | Hardcoded paths |
| `README.md` | 📝 Needs update | Missing sections |

### Priority order:
1. **Critical**: Security & secrets cleanup
2. **High**: Remove hardcoded user paths
3. **Medium**: Documentation updates
4. **Low**: Code cleanup and polish
