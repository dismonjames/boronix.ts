# Static File Serving & Caching

Boronix serves static files from the directory configured under `app.publicDir` (defaulting to `"public"`).

## Cache-Control Headers

Static files receive caching headers based on the active mode:

### Development Mode

All static file requests receive:

```http
Cache-Control: no-store
```

### Production Mode

- **Hashed Assets**: Filenames containing content hashes (e.g. `app.82db7f2a.js`, `style.73a71c0c.css`) receive long-term immutable caching headers:
  ```http
  Cache-Control: public, max-age=31536000, immutable
  ```
- **Regular Assets**: Assets without content hashes receive standard caching headers:
  ```http
  Cache-Control: public, max-age=3600
  ```

## ETags & Conditional Requests

Every static asset response includes `ETag` and `Last-Modified` headers.
Boronix supports conditional requests (`If-None-Match` / `If-Modified-Since`), returning `304 Not Modified` to save bandwidth when files are unchanged.
Path traversal attacks outside of the root public directory are safely blocked.
