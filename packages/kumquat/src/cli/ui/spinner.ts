import { isSpinnerEnabled } from "./terminal"
import { colors } from "./colors"
import { ERASE_LINE, CURSOR_LEFT } from "./ansi"

let activeSpinnerInterval: any = null
let currentText = ""
let frameIndex = 0
const frames = ["◐", "◓", "◑", "◒"]

export function startSpinner(text: string): void {
  if (!isSpinnerEnabled()) {
    console.log(text)
    return
  }

  stopSpinner(false)
  currentText = text
  frameIndex = 0

  process.stdout.write(`${CURSOR_LEFT}${colors.brand(frames[frameIndex] ?? "")} ${currentText}`)

  activeSpinnerInterval = setInterval(() => {
    frameIndex = (frameIndex + 1) % frames.length
    process.stdout.write(`${CURSOR_LEFT}${ERASE_LINE}${colors.brand(frames[frameIndex] ?? "")} ${currentText}`)
  }, 120)
}

export function updateSpinner(text: string): void {
  currentText = text
  if (!isSpinnerEnabled()) {
    console.log(text)
    return
  }
  process.stdout.write(`${CURSOR_LEFT}${ERASE_LINE}${colors.brand(frames[frameIndex] ?? "")} ${currentText}`)
}

export function stopSpinner(clear = true): void {
  if (activeSpinnerInterval) {
    clearInterval(activeSpinnerInterval)
    activeSpinnerInterval = null
  }
  if (isSpinnerEnabled() && clear) {
    process.stdout.write(`${CURSOR_LEFT}${ERASE_LINE}`)
  }
}
