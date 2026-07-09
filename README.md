# Boronix

Boronix is an experimental HTML-first fullstack framework for TypeScript.

It is server-first, SSR-first, and uses real HTML templates. Client JavaScript is not automatic, React is not part of the framework, and Bun is the first runtime target.

Boronix is dogfooded through a small homework app using login, dashboard-style HTML pages, local actions, and JSON APIs.

> [!IMPORTANT]
> Boronix is in early alpha. APIs may change before 1.0. Registry publishing is planned after package smoke tests pass. Boronix is not published to npm yet. For now, install from a local tarball or GitHub source.

## Install

For a new app:

```bash
bunx create-boronix my-app
cd my-app
bun install
bun run dev
```

For an existing app:

```bash
bun add boronix
```

## Create App

```bash
bunx create-boronix my-app
cd my-app
bun install
bun run dev
```

The generated app includes:

```json
{
  "scripts": {
    "dev": "boronix dev",
    "build": "boronix build",
    "start": "boronix start",
    "doctor": "boronix doctor"
  }
}
```

## Commands

```bash
boronix dev       # Start development server
boronix build     # Build production manifest
boronix start     # Start production server
boronix info      # Print environment information
boronix doctor    # Check project health
boronix typegen   # Generate route types
boronix routes    # List all project routes as a tree
boronix inspect   # Inspect matched files for a specific route
```

### CLI Dev Preview

```txt
◆ Boronix

  ✔ mode      dev
  ✔ runtime   bun
  ➜ local     http://localhost:3000
  ⌂ root      ~/Documents/homework-app

✔ ready, serving HTML in 58ms
```

### CLI Build Tree Preview

```txt
◆ Boronix

  ✔ mode      build
  ✔ runtime   bun
  ◇ output    .boronix

  app/routes
  │
  └─ root
     ├─ ✔ ○  /       page  4ms
     └─ ✔ ○  /login  page  6ms

✔ built server-rendered app in 41ms
```

Use Node runtime when needed:

```bash
boronix dev --runtime node
boronix build --runtime node
boronix start --runtime node
```

## Run The Example

```bash
bun run dev:basic
```

```bash
bun run dev:homework
```

## App Structure

```txt
app/
  routes/
    home/
      page.html
      page.ts
    exercises/
      page.html
      page.ts
      api.ts
  server/
  shared/
  layout.html
public/
boronix.config.ts
```

## Runtime

Bun is the primary runtime. Node has a basic adapter in v0.2.

```ts
import { defineConfig } from "boronix"

export default defineConfig({
  runtime: "bun"
})
```

Boronix is still alpha software. Expect small breaking fixes before a stable release.

## Page

```ts
import { page } from "boronix"

export default page(async () => {
  return { title: "Dashboard" }
})
```

```html
<h1>{{ title }}</h1>
```

## API

```ts
import { api, json } from "boronix"

export const GET = api(async () => {
  return json({ ok: true })
})
```

## Action

```ts
import { action, fail, redirect } from "boronix"

export const login = action(async ({ form }) => {
  const email = form.string("email")

  if (!email) {
    return fail({ message: "Missing email" })
  }

  return redirect("/exercises")
})
```

```html
<form method="post" action="?/login">
  <input name="email" type="email">
  <button>Login</button>
</form>
```

## License

MPL-2.0.
