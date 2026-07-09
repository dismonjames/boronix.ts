import type { RuntimeServer } from "./types"

export const denoRuntime: RuntimeServer = {
  serve() {
    throw new Error("Deno runtime is not implemented in Kumquat v0.1.")
  }
}
