import type { Session } from "./session"

export type Auth = {
  user<T = unknown>(): T | null
  login(user: unknown): void
  logout(): void
  requireUser<T = unknown>(): T
}

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required.")
    this.name = "AuthRequiredError"
  }
}

export function createAuth(session: Session): Auth {
  return {
    user<T = unknown>(): T | null {
      return session.get<T>("user")
    },
    login(user: unknown): void {
      session.set("user", user)
    },
    logout(): void {
      session.delete("user")
    },
    requireUser<T = unknown>(): T {
      const user = session.get<T>("user")
      if (!user) {
        throw new AuthRequiredError()
      }
      return user
    }
  }
}
