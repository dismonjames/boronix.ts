import { build } from "../../build/build"

export async function buildCommand(root: string): Promise<void> {
  await build(root)
}
