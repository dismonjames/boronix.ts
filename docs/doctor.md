# Kumquat Doctor

The `doctor` command inspects your project layout, route configuration, and runtime environment to diagnose common errors.

## Usage

```bash
kumquat doctor [options]
```

## Checks Performed

### 1. Project Checks
- **package.json**: Ensures a node configuration file is present.
- **kumquat.config.ts**: Verifies the core configuration is present.
- **app/routes**: Checks that the routes capsule folder exists.
- **public/**: Warns if the static assets folder is missing.

### 2. Routes Checks
- **no duplicate routes**: Detects duplicate definitions of page or API route capsules that clash on the same path.
- **route capsules valid**: Scans `page.ts` files to ensure they export a default router block (`export default page(...)`), and checks actions files to prevent invalid default exports.

### 3. Runtime Checks
- **bun / node availability**: Checks if the target runtimes are installed on the system.
- **runtime config**: Validates the selected runtime option in `kumquat.config.ts`.
- **session secret**: In `production` environment, alerts you if `session.secret` is using the insecure development default.

## Output

Returns exit code `0` if all critical checks pass, and `1` if there are any issues found. Warnings do not cause a non-zero exit code.
