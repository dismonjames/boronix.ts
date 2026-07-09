import { expect, test } from "bun:test"
import { renderTemplate } from "../packages/boronix/src/render/template"

test("renders variables", () => {
  expect(renderTemplate("<h1>{{ title }}</h1>", { title: "Hello" })).toBe("<h1>Hello</h1>")
})

test("escapes html", () => {
  expect(renderTemplate("{{ value }}", { value: "<script>alert(1)</script>" })).toBe("&lt;script&gt;alert(1)&lt;/script&gt;")
})

test("renders nested paths", () => {
  expect(renderTemplate("{{ user.name }}", { user: { name: "Minh" } })).toBe("Minh")
})

test("renders if blocks", () => {
  expect(renderTemplate("{{#if message}}yes{{/if}}", { message: "ok" })).toBe("yes")
  expect(renderTemplate("{{#if message}}yes{{/if}}", {})).toBe("")
})

test("renders each blocks", () => {
  const html = renderTemplate("{{#each items}}<p>{{ title }}</p>{{/each}}", {
    items: [{ title: "A" }, { title: "B" }]
  })
  expect(html).toBe("<p>A</p><p>B</p>")
})

test("missing keys render empty string", () => {
  expect(renderTemplate("<p>{{ missing.value }}</p>", {})).toBe("<p></p>")
})
