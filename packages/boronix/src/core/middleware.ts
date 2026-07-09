export type Middleware = (req: Request, next: () => Promise<Response>) => Promise<Response>
