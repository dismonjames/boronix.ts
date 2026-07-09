import { areColorsEnabled } from "./terminal"

export const colors = {
  brand: (str: string) => areColorsEnabled() ? `\x1b[38;5;208m${str}\x1b[0m` : str,
  success: (str: string) => areColorsEnabled() ? `\x1b[32m${str}\x1b[0m` : str,
  warning: (str: string) => areColorsEnabled() ? `\x1b[33m${str}\x1b[0m` : str,
  error: (str: string) => areColorsEnabled() ? `\x1b[31m${str}\x1b[0m` : str,
  muted: (str: string) => areColorsEnabled() ? `\x1b[90m${str}\x1b[0m` : str,
  path: (str: string) => areColorsEnabled() ? `\x1b[97m\x1b[1m${str}\x1b[0m` : str,
  method: (str: string) => areColorsEnabled() ? `\x1b[36m${str}\x1b[0m` : str,
  runtime: (str: string) => areColorsEnabled() ? `\x1b[38;5;208m${str}\x1b[0m` : str,
  source: (str: string) => areColorsEnabled() ? `\x1b[90m${str}\x1b[0m` : str,
  bold: (str: string) => areColorsEnabled() ? `\x1b[1m${str}\x1b[0m` : str,
}
