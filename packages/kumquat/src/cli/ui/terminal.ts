let colorsEnabled = true
let unicodeEnabled = true
let spinnerEnabled = true

export function initUiSettings(options: { plain?: boolean | undefined; noColor?: boolean | undefined } = {}): void {
  const noColorEnv = process.env.NO_COLOR !== undefined && process.env.NO_COLOR !== "0"
  const ciEnv = process.env.CI !== undefined && process.env.CI !== "false"
  const termDumb = process.env.TERM === "dumb"
  const isTTY = process.stdout.isTTY === true

  if (options.plain || options.noColor || noColorEnv || ciEnv || termDumb || !isTTY) {
    colorsEnabled = false
  } else {
    colorsEnabled = true
  }

  if (options.plain || termDumb) {
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
