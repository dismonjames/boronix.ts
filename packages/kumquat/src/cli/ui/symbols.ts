import { isUnicodeEnabled } from "./terminal"

export const symbols = {
  header: () => isUnicodeEnabled() ? "◆" : "*",
  success: () => isUnicodeEnabled() ? "✔" : "OK",
  warning: () => isUnicodeEnabled() ? "⚠" : "WARN",
  error: () => isUnicodeEnabled() ? "✖" : "ERR",
  redirect: () => isUnicodeEnabled() ? "➜" : "->",
  home: () => isUnicodeEnabled() ? "⌂" : "root",
  output: () => isUnicodeEnabled() ? "◇" : "-",
  page: () => isUnicodeEnabled() ? "○" : "page",
  fn: () => isUnicodeEnabled() ? "ƒ" : "fn",
  info: () => isUnicodeEnabled() ? "•" : "*",
  line: () => isUnicodeEnabled() ? "│" : "|",
  branch: () => isUnicodeEnabled() ? "├─" : "|-",
  lastBranch: () => isUnicodeEnabled() ? "└─" : "`-",
}
