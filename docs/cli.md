# Kumquat.ts CLI Reference

The Kumquat.ts command-line interface provides tools for development, building, and inspecting your fullstack applications.

## Usage

```bash
kumquat <command> [options]
```

## Commands

### `dev`
Start the development server with live route scanning and interactive TUI output.

```bash
kumquat dev [options]
```

**Options:**
- `--root <dir>`: Project root directory (default: `.`)
- `--runtime <bun|node>`: Target server runtime (default: `bun`)
- `-p, --port <port>`: Port to listen on (default: `3000`)
- `-H, --host <host>`: Host to bind to (default: `0.0.0.0`)
- `--plain`: Disable colors, unicode, and spinner
- `--no-color`: Disable terminal colors

### `build`
Compile your server-rendered app and generate a production manifest in `.kumquat`.

```bash
kumquat build [options]
```

**Options:**
- `--root <dir>`: Project root directory
- `--runtime <bun|node>`: Production target runtime
- `--plain`: Disable styling
- `--no-color`: Disable colors

### `start`
Start the production server using the built manifest in `.kumquat`.

```bash
kumquat start [options]
```

**Options:**
- `--root <dir>`: Project root directory
- `--runtime <bun|node>`: Production server runtime override
- `-p, --port <port>`: Server port override
- `-H, --host <host>`: Server host override
- `--plain`: Disable styling
- `--no-color`: Disable colors

---

## Global Flags

- `-h, --help`: Show help message
- `-v, --version`: Show version number
- `--plain`: Force plain text output (removes color, unicode, spinner)
- `--no-color`: Turn off ANSI coloring
