import { startDevServer } from "../../dev/dev-server"

export async function devCommand(root: string): Promise<void> {
  await startDevServer(root)
}
