# Tutorial: Building a Boronix App

This tutorial guides you through building a simple Boronix app from scratch. We will create a user page, a login loader/action, redirect flows, custom 404 boundaries, error boundaries, type generation, and CLI diagnostics.

---

## 1. Create a New App
Initialize your Boronix project using `create-boronix`:
```bash
npx create-boronix my-todo-app
cd my-todo-app
bun install
```

## 2. Examine the Directory Structure
A basic Boronix app is structured as:
```
my-todo-app/
├── app/
│   ├── layout.html
│   ├── error.html
│   ├── not-found.html
│   └── routes/
│       └── home/
│           ├── page.html
│           └── page.ts
├── public/
├── boronix.config.ts
└── package.json
```

## 3. Create a Route with a Page Loader
Let's create a dynamic route `/todo/[id]` to show a specific task.

Create directory `app/routes/todo/[id]` and files:
`app/routes/todo/[id]/page.ts`:
```ts
import { page, notFound } from "boronix"

// Simple mock store
const TODOS: Record<string, string> = {
  "1": "Learn Boronix core features",
  "2": "Build error boundaries"
}

export default page(async ({ params }) => {
  const todo = TODOS[params.id]
  
  if (!todo) {
    // Triggers local or global not-found resolution
    throw notFound()
  }

  return {
    id: params.id,
    todo
  }
})
```

`app/routes/todo/[id]/page.html`:
```html
<h2>Todo Item #{{ id }}</h2>
<p>Task: <strong>{{ todo }}</strong></p>
<a href="/">Back Home</a>
```

## 4. Handle Forms with Action Mappings
Let's create a route for creating a task with validation.

Create folder `app/routes/new` and files:
`app/routes/new/page.html`:
```html
<h2>Create Todo</h2>

<form method="post" action="?/create">
  <div>
    <label>Task Description:</label>
    <input type="text" name="description" value="{{ values.description }}" />
    {{#if fields.description}}
      <span style="color: red;">{{ fields.description }}</span>
    {{/if}}
  </div>
  <button type="submit">Add Todo</button>
</form>
```

`app/routes/new/actions.ts`:
```ts
import { action, fail, redirect } from "boronix"

export const create = action(async ({ form }) => {
  const desc = form.required("description", "Task description is required")
  form.min("description", 3, "Description must be at least 3 characters")

  if (!form.isValid()) {
    return fail({
      fields: form.errors(),
      values: form.values()
    })
  }

  // Normally we would save it. Here we redirect to home.
  return redirect("/")
})
```

## 5. Add Custom Error Boundaries
Create a route-specific boundary under `app/routes/todo/[id]/error.html`:
```html
<div style="border: 2px solid red; padding: 20px; border-radius: 8px;">
  <h3>Oops, something went wrong on this dynamic route!</h3>
  <p>{{ message }}</p>
  <a href="/">Go back home</a>
</div>
```

## 6. Type Generation
Run the typegen command to build route definitions:
```bash
bun run typegen
```
This writes types into `.boronix/types/routes.d.ts`. You can use `BoronixRoute` and `RouteParams` types to get complete type-safety.

## 7. Route Inspections
To verify the route structure, request details, layouts, and files, use the CLI:
```bash
bunx boronix inspect /todo/1
```
Or for action inspection:
```bash
bunx boronix inspect "/new?/create"
```
Or to retrieve parseable JSON output:
```bash
bunx boronix inspect /todo/1 --json
```
