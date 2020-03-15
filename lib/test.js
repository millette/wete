"use strict"

// npm
const Vfile = require("vfile")

// self
const { Context, makeProcessor } = require("./utils")

test("create page", async () => {
  const ctx = new Context()

  const p = makeProcessor(ctx)

  const dd = await p(
    "<p>dudu <a href='cnt?hop'>Cnt</a>",
    "joe",
    "newpage",
    true
  )

  const d1 = dd.docs.get("/newpage")

  expect(d1 instanceof Vfile).toBeTruthy()
  expect(d1.data.internalLinks.length).toBe(1)

  expect(d1.toString()).toBe(`<p>dudu <a href="/cnt?hop">Cnt</a></p>`)

  const d2 = dd.docs.get("/cnt")

  expect(d2 instanceof Vfile).toBeTruthy()
  expect(d2.data.internalLinks.length).toBe(1)

  expect(d2.toString()).toBe(
    `<p>Stub of <code>cnt</code> from <code><a href="/newpage">newpage (Cnt)</a></code> by <code>joe</code>.</p>`
  )
})

test("update page #1", async () => {
  const ctx = new Context()

  const p = makeProcessor(ctx)

  const dd0 = await p("bobo-cnt", "bob", "home")
  const dd = dd0.docs.get("/home")
  expect(dd instanceof Vfile).toBeTruthy()
  expect(dd.data.internalLinks).toBeFalsy()
  expect(dd.data.editOf).toBeTruthy()
})

test("update page #2", async () => {
  const ctx = new Context()

  const p = makeProcessor(ctx)

  const dd = await p(
    "<p>dudu <a href='cnt?hop'>Cnt</a>",
    "joe",
    "newpage",
    true
  )

  const dd1 = dd.docs.get("/newpage")

  const dd2 = await p("<p>dudu <a href='home'>Cnt</a>", "joe", dd1)

  expect(dd2.docs.size).toBe(2)
  expect(dd2.wholeBatch.length).toBe(8)
  expect(dd2.wholeBatch.filter(({ type }) => type === "del").length).toBe(1)
})
