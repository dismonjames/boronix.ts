# Production Security Hardening

Boronix implements production security best practices by default.

## Basic Security Headers

The following response headers are set automatically in production:
- **`X-Content-Type-Options: nosniff`**: Prevents browser MIME-type sniffing.
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Controls how referrer details are shared.
- **`X-Frame-Options: SAMEORIGIN`**: Prevents Clickjacking attacks.

### Configuration

You can enable/disable or override security headers in `boronix.config.ts`:

```ts
export default defineConfig({
  security: {
    headers: {
      contentTypeOptions: "nosniff",
      referrerPolicy: "strict-origin-when-cross-origin",
      frameOptions: "SAMEORIGIN"
    }
  }
})
```

Set `security.headers: false` to disable them completely.

## Production Error Safety

To prevent information disclosure, 500 error responses in production will:
- Never leak stack traces.
- Never leak local absolute file paths.
- Never leak source code frames.
- Never leak database credentials or configuration details.

Page requests render clean HTML 500 pages with an obfuscated message, whereas API requests return sanitized JSON error envelopes alongside a unique Request ID:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Internal Server Error",
    "requestId": "req_82db7f2a73a71c0c"
  }
}
```
