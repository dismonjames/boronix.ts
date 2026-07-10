export type BoronixMode = "development" | "production"

export function getBoronixMode(): BoronixMode {
  if (process.env.BORONIX_ENV === "development" || process.env.BORONIX_ENV === "production") {
    return process.env.BORONIX_ENV
  }
  if (process.env.NODE_ENV === "production") {
    return "production"
  }
  return "development"
}

export function setBoronixMode(mode: BoronixMode): void {
  process.env.BORONIX_ENV = mode
}
