export type BodyReader = {
  json<T = unknown>(): Promise<T>
  text(): Promise<string>
  form(): Promise<FormData>
}

export function createBodyReader(req: Request): BodyReader {
  return {
    json: async <T = unknown>() => req.json() as Promise<T>,
    text: async () => req.text(),
    form: async () => req.formData()
  }
}
