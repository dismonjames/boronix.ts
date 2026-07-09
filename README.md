# Goros

Goros is an experimental HTML-first fullstack framework for TypeScript.

It is server-first, SSR-first, and uses real HTML templates. Client JavaScript is not automatic, React is not part of the framework, and Bun is the first runtime target.

Goros is dogfooded through a small homework app using login, dashboard-style HTML pages, local actions, and JSON APIs.

> [!IMPORTANT]
> Goros is in early alpha. APIs may change before 1.0. Registry publishing is planned after package smoke tests pass. Goros is not published to npm yet. For now, install from a local tarball or GitHub source.

## Install

For a new app:

```bash
bunx create-goros my-app
cd my-app
bun install
bun run dev
```

For an existing app:

```bash
bun add goros
```

## Create App

```bash
bunx create-goros my-app
cd my-app
bun install
bun run dev
```

The generated app includes:

```json
{
  "scripts": {
    "dev": "goros dev",
    "build": "goros build",
    "start": "goros start",
    "doctor": "goros doctor"
  }
}
```

## Commands

```bash
goros dev       # Start development server
goros build     # Build production manifest
goros start     # Start production server
goros info      # Print environment information
goros doctor    # Check project health
goros typegen   # Generate route types
goros routes    # List all project routes as a tree
goros inspect   # Inspect matched files for a specific route
```

### CLI Dev Preview

```txt
◆ Goros

  ✔ mode      dev
  ✔ runtime   bun
  ➜ local     http://localhost:3000
  ⌂ root      ~/Documents/homework-app

✔ ready, serving HTML in 58ms
```

### CLI Build Tree Preview

```txt
◆ Goros

  ✔ mode      build
  ✔ runtime   bun
  ◇ output    .goros

  app/routes
  │
  └─ root
     ├─ ✔ ○  /       page  4ms
     └─ ✔ ○  /login  page  6ms

✔ built server-rendered app in 41ms
```

Use Node runtime when needed:

```bash
goros dev --runtime node
goros build --runtime node
goros start --runtime node
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
goros.config.ts
```

## Runtime

Bun is the primary runtime. Node has a basic adapter in v0.2.

```ts
import { defineConfig } from "goros"

export default defineConfig({
  runtime: "bun"
})
```

Goros is still alpha software. Expect small breaking fixes before a stable release.

## Page

```ts
import { page } from "goros"

export default page(async () => {
  return { title: "Dashboard" }
})
```

```html
<h1>{{ title }}</h1>
```

## API

```ts
import { api, json } from "goros"

export const GET = api(async () => {
  return json({ ok: true })
})
```

## Action

```ts
import { action, fail, redirect } from "goros"

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
