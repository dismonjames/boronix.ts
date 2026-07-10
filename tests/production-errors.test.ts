import { expect, test } from "bun:test"
import { handleDevOrErrorPageResponse } from "../packages/boronix/src/core/app"
import { defaultConfig } from "../packages/boronix/src/config/types"

const options = {
  root: "/home/minh/app-dir",
  config: {
    ...defaultConfig,
    session: {
      ...defaultConfig.session,
      secret: "SUPER_SECRET_BORONIX_SESSION_SECRET"
    }
  },
  dev: false // production
}

const req = new Request("http://localhost/")
const url = new URL("http://localhost/")

test("production HTML error response does not leak sensitive information", () => {
  const err = new Error("Database connection failed for DATABASE_URL=postgres://user:pass@host/db")
  const response = handleDevOrErrorPageResponse(err, "unknown", req, url, [], options)
  
  expect(response.status).toBe(500)
  
  return response.text().then(html => {
    // Should render a generic "Internal Server Error"
    expect(html).toContain("Internal Server Error")
    
    // Should NOT contain sensitive details
    expect(html).not.toContain("/home/minh/")
    expect(html).not.toContain("/tmp/")
    expect(html).not.toContain("app/routes/")
    expect(html).not.toContain("node_modules/")
    expect(html).not.toContain("stack")
    expect(html).not.toContain("DATABASE_URL")
    expect(html).not.toContain("SUPER_SECRET_BORONIX_SESSION_SECRET")
  })
})

test("production API error response does not leak internal details", () => {
  const err = new Error("Database connection failed for DATABASE_URL=postgres://user:pass@host/db")
  const apiReq = new Request("http://localhost/api/users")
  const apiUrl = new URL("http://localhost/api/users")
  const response = handleDevOrErrorPageResponse(err, "unknown", apiReq, apiUrl, [], options, undefined, "req_123")

  expect(response.status).toBe(500)
  
  return response.json().then(data => {
    expect(data).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
        requestId: "req_123"
      }
    })
  })
})
