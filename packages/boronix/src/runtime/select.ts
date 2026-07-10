import type { ResolvedBoronixConfig } from "../config/types"
import { denoRuntime } from "./deno"
import { nodeRuntime } from "./node"
import type { RuntimeServer } from "./types"

export function selectRuntime(runtime: ResolvedBoronixConfig["runtime"]): RuntimeServer {
  if (runtime === "bun") {
    return {
      serve(options) {
        if (typeof globalThis.Bun === "undefined") {
          throw new Error("Bun is required for runtime \"bun\".")
        }
        return globalThis.Bun.serve({
          port: options.port,
          hostname: options.host,
          fetch: options.fetch
        })
      }
    }
  }
  if (runtime === "node") return nodeRuntime
  return denoRuntime
}
