import type { RuntimeServer } from "./types"

export const bunRuntime: RuntimeServer = {
  serve(options) {
    return Bun.serve({
      port: options.port,
      hostname: options.host,
      fetch: options.fetch
    })
  }
}
