import { isUnicodeEnabled } from "./terminal"

export const symbols = {
  header: () => isUnicodeEnabled() ? "◇" : "*",
  success: () => isUnicodeEnabled() ? "✓" : "OK",
  warning: () => isUnicodeEnabled() ? "⚠" : "WARN",
  error: () => isUnicodeEnabled() ? "✕" : "ERR",
  page: () => isUnicodeEnabled() ? "○" : "page",
  fn: () => isUnicodeEnabled() ? "ƒ" : "fn",
  info: () => isUnicodeEnabled() ? "•" : "*",
}
