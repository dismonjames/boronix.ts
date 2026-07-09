export class KumquatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "KumquatError"
  }
}
