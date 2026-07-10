import { execSync } from "node:child_process"
import path from "node:path"

console.log("Building boronix...")
execSync("npm run build", { cwd: path.resolve("packages/boronix"), stdio: "inherit" })

console.log("Building create-boronix...")
execSync("npm run build", { cwd: path.resolve("packages/create-boronix"), stdio: "inherit" })
