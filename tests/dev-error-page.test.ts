import { expect, test } from "bun:test"
import { renderDevErrorPage, diagnoseError } from "../packages/boronix/src/core/errors"

test("dev error page renders HTML on loader crash", () => {
  const error = new Error("Test error message")
  const diagnostic = diagnoseError(error, ".", "page-loader")
  diagnostic.route = "/test"
  
  const html = renderDevErrorPage(diagnostic)
  expect(html).toContain("Boronix Dev Error")
  expect(html).toContain("Test error message")
  expect(html).toContain("page-loader")
})
