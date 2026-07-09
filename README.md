# Kumquat.ts

Kumquat.ts is an experimental HTML-first fullstack framework for TypeScript.

It is server-first, SSR-first, and uses real HTML templates. Client JavaScript is not automatic, React is not part of the framework, and Bun is the first runtime target.

Kumquat is dogfooded through a small homework app using login, dashboard-style HTML pages, local actions, and JSON APIs.

v0.2 adds nested layouts, signed cookie sessions, minimal auth helpers, flash messages, form validation helpers, and a Node runtime adapter.

## Install

For a new app:

```bash
bunx create-kumquat my-app
cd my-app
bun install
bun run dev
```

For an existing app:

```bash
bun add kumquat
```

## Create App

```bash
bunx create-kumquat my-app
cd my-app
bun install
bun run dev
```

The generated app includes:

```json
{
  "scripts": {
    "dev": "kumquat dev",
    "build": "kumquat build",
    "start": "kumquat start",
    "doctor": "kumquat doctor"
  }
}
```

## Commands

```bash
kumquat dev       # Start development server
kumquat build     # Build production manifest
kumquat start     # Start production server
kumquat info      # Print environment information
kumquat doctor    # Check project health
kumquat typegen   # Generate route types
kumquat routes    # List all project routes as a tree
kumquat inspect   # Inspect matched files for a specific route
```

### CLI Dev Preview

```txt
◆ Kumquat.ts

  ✔ mode      dev
  ✔ runtime   bun
  ➜ local     http://localhost:3000
  ⌂ root      ~/Documents/homework-app

✔ ready, serving HTML in 58ms
```

### CLI Build Tree Preview

```txt
◆ Kumquat.ts

  ✔ mode      build
  ✔ runtime   bun
  ◇ output    .kumquat

  app/routes
  │
  └─ root
     ├─ ✔ ○  /       page  4ms
     └─ ✔ ○  /login  page  6ms

✔ built server-rendered app in 41ms
```

Use Node runtime when needed:

```bash
kumquat dev --runtime node
kumquat build --runtime node
kumquat start --runtime node
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
kumquat.config.ts
```

## Runtime

Bun is the primary runtime. Node has a basic adapter in v0.2.

```ts
import { defineConfig } from "kumquat"

export default defineConfig({
  runtime: "bun"
})
```

Kumquat is still alpha software. Expect small breaking fixes before a stable release.

## Page

```ts
import { page } from "kumquat"

export default page(async () => {
  return { title: "Dashboard" }
})
```

```html
<h1>{{ title }}</h1>
```

## API

```ts
import { api, json } from "kumquat"

export const GET = api(async () => {
  return json({ ok: true })
})
```

## Action

```ts
import { action, fail, redirect } from "kumquat"

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
