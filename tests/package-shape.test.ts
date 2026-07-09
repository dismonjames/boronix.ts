import { expect, test } from "bun:test"
import kumquatPackage from "../packages/boronix/package.json" with { type: "json" }
import createPackage from "../packages/create-boronix/package.json" with { type: "json" }

test("boronix package exposes bin exports and publish files", () => {
  expect(kumquatPackage.bin.boronix).toBe("dist/cli/main.js")
  expect(kumquatPackage.exports["."].import).toBe("./dist/index.js")
  expect(kumquatPackage.exports["."].types).toBe("./dist/index.d.ts")
  expect(kumquatPackage.files).toContain("dist")
  expect(kumquatPackage.files).toContain("README.md")
  expect(kumquatPackage.files).toContain("LICENSE")
  expect(kumquatPackage.license).toBe("MPL-2.0")
})

test("create-boronix package exposes generator bin and template files", () => {
  expect(createPackage.bin["create-boronix"]).toBe("dist/index.js")
  expect(createPackage.files).toContain("dist")
  expect(createPackage.files).toContain("src/templates")
  expect(createPackage.license).toBe("MPL-2.0")
})
