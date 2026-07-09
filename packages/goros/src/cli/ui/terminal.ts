let colorsEnabled = true
let unicodeEnabled = true
let spinnerEnabled = true

export function initUiSettings(
  options: { plain?: boolean | undefined; noColor?: boolean | undefined } = {},
  configTheme?: { color?: boolean; unicode?: boolean }
): void {
  const noColorEnv = process.env.NO_COLOR !== undefined && process.env.NO_COLOR !== "0"
  const ciEnv = process.env.CI !== undefined && process.env.CI !== "false"
  const termDumb = process.env.TERM === "dumb"
  const isTTY = process.stdout.isTTY === true

  const configColor = configTheme?.color ?? true
  const configUnicode = configTheme?.unicode ?? true

  if (options.plain || options.noColor || noColorEnv || ciEnv || termDumb || !isTTY || !configColor) {
    colorsEnabled = false
  } else {
    colorsEnabled = true
  }

  if (options.plain || termDumb || !configUnicode) {
    unicodeEnabled = false
  } else {
    unicodeEnabled = true
  }

  if (options.plain || ciEnv || termDumb || !isTTY) {
    spinnerEnabled = false
  } else {
    spinnerEnabled = true
  }
}

export function areColorsEnabled(): boolean {
  return colorsEnabled
}

export function isUnicodeEnabled(): boolean {
  return unicodeEnabled
}

export function isSpinnerEnabled(): boolean {
  return spinnerEnabled
}

export function getTerminalWidth(): number {
  return process.stdout.columns ?? 80
}

import os from "node:os"
export function getNetworkAddress(): string | undefined {
  try {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name]
      if (!iface) continue
      for (const info of iface) {
        if (info.family === "IPv4" && !info.internal) {
          return info.address
        }
      }
    }
  } catch {}
  return undefined
}

import { exec } from "node:child_process"
export function openBrowser(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const platform = process.platform
    let cmd = ""
    if (platform === "darwin") {
      cmd = `open "${url}"`
    } else if (platform === "win32") {
      cmd = `start "${url}"`
    } else {
      cmd = `xdg-open "${url}"`
    }
    exec(cmd, (err) => {
      if (err) resolve(false)
      else resolve(true)
    })
  })
}
