# inspect Command

The `inspect` command resolves a specific request URL route, extracting matched dynamic parameters and all physical route capsule files (pages, loaders, actions, layouts).

## Usage

```bash
boronix inspect <pathname> [options]
```

## Example Output

### Matching Dynamic Route

```txt
◆ Boronix inspect

  ◆ /exercises/12
  │
  ├─ matched
  │  └─ /exercises/:id
  │
  ├─ params
  │  └─ id  12
  │
  └─ files
     ├─ page     app/routes/exercises/[id]/page.html
     ├─ loader   app/routes/exercises/[id]/page.ts
     ├─ actions  app/routes/exercises/[id]/actions.ts
     └─ layout   app/layout.html

✔ route resolved
```

### Non-matching Route

```txt
✖ Boronix error KQ_ROUTE_NOT_FOUND

No route matched `/missing`.

Hint:
  Run `boronix routes` to see available routes.
```
