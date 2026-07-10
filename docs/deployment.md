# Production Deployment Guide

Deploying a Boronix application to production.

## Deployment Flow

1. **Scaffold & Build**:
   ```bash
   bun install
   bun run build
   ```
2. **Validate**:
   Run the production doctor checks:
   ```bash
   bun run doctor:production
   ```
3. **Start Server**:
   Configure environment variables and start the server:
   ```bash
   BORONIX_SESSION_SECRET="highly-secure-secret-key" bun run start
   ```

## Production Guidelines

### Environment Variables

Configure these settings on your host:
- `BORONIX_ENV`: Set to `"production"`.
- `BORONIX_SESSION_SECRET`: Set to a long, random secret key.
- `BORONIX_PORT` (or `PORT`): Server listener port (e.g. `3000`).
- `BORONIX_HOST` (or `HOST`): Interface host (e.g. `0.0.0.0` or `127.0.0.1`).

### Process Management

Use a process manager like **systemd** or **pm2** to run the boronix server in the background and handle auto-restarts on failure.

#### Example systemd Service File (`/etc/systemd/system/boronix.service`):

```ini
[Unit]
Description=Boronix Application
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/var/www/my-app
ExecStart=/usr/local/bin/bun run start
Restart=on-failure
Environment=BORONIX_ENV=production
Environment=BORONIX_SESSION_SECRET=some-long-random-secret
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### Reverse Proxy

It is recommended to run a reverse proxy like **Nginx** or **Caddy** in front of your Boronix server. This provides:
- SSL termination (HTTPS).
- Gzip compression.
- Rate limiting.
- Load balancing.
