# routes Command

The `routes` command displays all registered page, API, and action routes defined in your project capsules under a tree layout.

## Usage

```bash
goros routes [options]
```

## Options

- `--json`: Output routes list as machine-readable JSON.
- `--full`: Output absolute paths of matched source modules.
- `--flat`: Output a flat route list instead of a tree structure.

## Example Output

### Default (Tree Layout)

```txt
◆ Goros routes

  app/routes
  │
  ├─ root
  │  ├─ ○  GET   /                       page    home/page.html
  │  ├─ ○  GET   /login                  page    login/page.html
  │  └─ ƒ  POST  /login?/login           action  login/actions.ts
  │
  └─ exercises
     ├─ ○  GET   /exercises              page    exercises/page.html
     ├─ ƒ  GET   /api/exercises          api     exercises/api.ts
     ├─ ○  GET   /exercises/:id          page    exercises/[id]/page.html
     └─ ƒ  POST  /exercises/:id?/submit  action  exercises/[id]/actions.ts

✔ found 7 routes
```
