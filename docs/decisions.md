# Architectural Decisions Log - Boronix Rebrand

This document outlines design and rebranding decisions made during version `v0.2.5`.

## Decisions

### 1. NPM Registry Name Availability Verification
- Checked name availability for `boronix` and `create-boronix` on the public npm registry.
- Both packages returned `404 Not Found` (confirming they are completely available to claim and publish).

### 2. Configuration File Fallbacks
- We prefer the new `boronix.config.ts` configuration file.
- If it is missing, we fall back to `kumquat.config.ts` if it exists, logging a deprecation warning:
  `⚠ kumquat.config.ts is deprecated. Rename it to boronix.config.ts.`

### 3. Build Manifest Migrations
- Production builds are output to `.boronix/` containing `manifest.json`.
- If a legacy `.kumquat/` folder is detected on server boot, `boronix start` will fail with code 1 and guide the user to rebuild:
  `Found old .kumquat build output. Run \`boronix build\` to generate .boronix.`

### 4. Git Tagging Constraint
- Git tagging is not executed automatically, following the directive: "Do not create tag unless explicitly asked."

## v0.3.0 Decisions

### 1. Action Helper Wrapper Validation
- Attached a non-enumerable property `_isBoronixAction: true` to the action handler returned by `action()`.
- Used this flag in `handleAction` to throw `KQ_ACTION_NOT_WRAPPED` if a named export in `actions.ts` is not wrapped in `action()`.

### 2. Error Phase Separation
- Dynamic route/request processing phases are tracked using try/catch blocks tagging the error with the corresponding phase: `config`, `middleware`, `layout`, `page-loader`, `page-render`, `api`, `action`, `static`, `router`.

### 3. Stack Trace Cleaning and Caret Pointing
- Normalized filenames using root relative paths.
- Extracted exact line and column numbers from the first user stack frame, generating an aligned code frame snippet. The caret points directly to the matching character.

### 4. 404/NotFound throwing/returning Response
- Defined `notFound()` to return a 404 Response. Intercepted 404 Responses (returned or thrown) inside loaders/APIs/actions to trigger custom `not-found.html` page rendering or 404 JSON response.
