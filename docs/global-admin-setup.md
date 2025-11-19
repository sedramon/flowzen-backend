# Global Admin Setup

## Purpose
- Provision and rollback the global superadmin account without relying on environment variables.
- Seed global scopes, role metadata, and tenant status flags required by the global admin UI.

## Endpoints

### `POST /admin/setup/superadmin`
- **Body**
  ```json
  {
    "protectToken": "superadminSetup2025",
    "superadmin": {
      "email": "global.admin@flowzen.io",
      "password": "superadmin"
    },
    "scopes": [
      "global.tenants:read",
      "global.tenants:create",
      "global.tenants:update",
      "global.tenants:suspend",
      "global.tenants:activate",
      "global.users:read",
      "global.users:create",
      "global.users:update",
      "global.users:delete",
      "global.scopes:*",
      "global.audit:*",
      "global.settings:*"
    ]
  }
  ```
- **What it does**
  - Validates the protection token.
  - Upserts the provided scopes with `category: "global"`.
  - Upserts the `superadmin` role with `tenant = null`, `type = "global"`, and attaches the scopes.
  - Creates/updates the superadmin user with `tenant = null`, hashed password, and the supplied scopes.
  - Normalises existing tenants (`status = "active"`, clears suspension data).
  - Sets `category`/`type` defaults on legacy scopes and roles.
  - Emits `superadmin-setup` audit log entry.
  - Responds with a structured summary (scopes, role, user, tenants) including the plain password for confirmation.

### `POST /admin/setup/superadmin/rollback`
- **Body**
  ```json
  {
    "protectToken": "superadminSetup2025",
    "superadminEmail": "global.admin@flowzen.io",
    "scopesPrefix": "global."
  }
  ```
- **What it does**
  - Validates the protection token.
  - Deletes scopes starting with the given prefix.
  - Deletes the `superadmin` role when unused.
  - Deletes the superadmin user by email.
  - Emits `superadmin-rollback` audit log entry.
  - Returns a summary of deleted vs. skipped resources.

## Post-Setup Steps
- Log in with the seeded credentials. Change the password immediately through the standard password update flow.
- Verify that global routes (`/admin/*`) are accessible and tenant routes still enforce `TenantScopesGuard`.
- Confirm that `@Scopes` decorators on tenant controller endpoints match the seeded global scope names.

## Postman Collection Tips
- Include two environments: `pre-setup` (without Authorization header) and `post-setup` (with JWT).
- For setup requests disable `X-CSRF-Token` header if the server issues CSRF tokens only after login.
- Save responses to track which resources were created or skipped across runs.

## Troubleshooting
- **403 on setup endpoints**: token mismatch. Ensure `protectToken` equals `superadminSetup2025`.
- **Duplicate key errors during setup**: clean up stale test data or run the rollback endpoint first.
- **Scopes missing on login**: rerun setup with the full scope list to reattach to the role/user.

## Defaults
- Email: `global.admin@flowzen.io`
- Password: `superadmin` (change after first login)
- Scope prefix: `global.`
