import { execSync } from "node:child_process"

execSync("npx vitest run", { stdio: "inherit" })
