import { expect, test } from "bun:test"
import templatePackage from "../packages/create-goros/src/templates/basic/package.json" with { type: "json" }
import { existsSync } from "node:fs"
import path from "node:path"

const templateRoot = path.resolve("packages/create-goros/src/templates/basic")

test("create template includes route capsules and config", () => {
  expect(existsSync(path.join(templateRoot, "app/routes/home/page.html"))).toBe(true)
  expect(existsSync(path.join(templateRoot, "app/routes/login/actions.ts"))).toBe(true)
  expect(existsSync(path.join(templateRoot, "app/routes/exercises/api.ts"))).toBe(true)
  expect(existsSync(path.join(templateRoot, "goros.config.ts"))).toBe(true)
})

test("create template package has runnable scripts", () => {
  expect(templatePackage.scripts.dev).toBe("goros dev")
  expect(templatePackage.scripts.build).toBe("goros build")
  expect(templatePackage.scripts.start).toBe("goros start")
  expect(templatePackage.dependencies.goros).toBe("^0.2.5")
})
