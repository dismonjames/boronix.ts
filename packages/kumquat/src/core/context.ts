import type { Auth } from "./auth"
import type { Flash } from "./flash"
import type { Session } from "./session"

export type BaseContext = {
  req: Request
  url: URL
  params: Record<string, string>
  query: URLSearchParams
  session: Session
  auth: Auth
  flash: Flash
}
