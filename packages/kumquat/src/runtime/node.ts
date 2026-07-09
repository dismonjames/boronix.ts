import type { RuntimeServer } from "./types"

export const nodeRuntime: RuntimeServer = {
  serve() {
    throw new Error("Node runtime is not implemented in Kumquat v0.1.")
  }
}
