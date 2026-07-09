import type { Session } from "./session"

export type FlashMessage = {
  type: string
  message: string
}

export type Flash = {
  set(type: string, message: string): void
  get(type?: string): FlashMessage[]
  consume(type?: string): FlashMessage[]
}

const flashKey = "__goros_flash"

export function createFlash(session: Session): Flash {
  return {
    set(type: string, message: string): void {
      const messages = readMessages(session)
      messages.push({ type, message })
      session.set(flashKey, messages)
    },
    get(type?: string): FlashMessage[] {
      return filterMessages(readMessages(session), type)
    },
    consume(type?: string): FlashMessage[] {
      const messages = readMessages(session)
      const consumed = filterMessages(messages, type)
      const remaining = type ? messages.filter((message) => message.type !== type) : []

      if (remaining.length > 0) {
        session.set(flashKey, remaining)
      } else {
        session.delete(flashKey)
      }

      return consumed
    }
  }
}

function readMessages(session: Session): FlashMessage[] {
  const value = session.get<unknown>(flashKey)
  if (!Array.isArray(value)) return []

  return value.filter(isFlashMessage)
}

function filterMessages(messages: FlashMessage[], type?: string): FlashMessage[] {
  return type ? messages.filter((message) => message.type === type) : messages
}

function isFlashMessage(value: unknown): value is FlashMessage {
  if (typeof value !== "object" || value === null) return false
  const message = value as Record<string, unknown>
  return typeof message.type === "string" && typeof message.message === "string"
}
