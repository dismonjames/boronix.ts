import { expect, test } from "bun:test"
import kumquatPackage from "../packages/goros/package.json" with { type: "json" }
import createPackage from "../packages/create-goros/package.json" with { type: "json" }

test("goros package exposes bin exports and publish files", () => {
  expect(kumquatPackage.bin.goros).toBe("dist/cli/main.js")
  expect(kumquatPackage.exports["."].import).toBe("./dist/index.js")
  expect(kumquatPackage.exports["."].types).toBe("./dist/index.d.ts")
  expect(kumquatPackage.files).toContain("dist")
  expect(kumquatPackage.files).toContain("README.md")
  expect(kumquatPackage.files).toContain("LICENSE")
  expect(kumquatPackage.license).toBe("MPL-2.0")
})

test("create-goros package exposes generator bin and template files", () => {
  expect(createPackage.bin["create-goros"]).toBe("dist/index.js")
  expect(createPackage.files).toContain("dist")
  expect(createPackage.files).toContain("src/templates")
  expect(createPackage.license).toBe("MPL-2.0")
})
