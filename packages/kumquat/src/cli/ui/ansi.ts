export const ESC = "\x1b"
export const RESET = "\x1b[0m"
export const ERASE_LINE = "\x1b[K"
export const CURSOR_LEFT = "\r"

export function cursorUp(n = 1): string {
  return `\x1b[${n}A`
}

export function cursorDown(n = 1): string {
  return `\x1b[${n}B`
}
