"use strict"

// npm
const Vfile = require("vfile")
const memdown = require("memdown")
const levelup = require("levelup")
const encode = require("encoding-down")

// self
const makeProcessor = require("./utils")
const DbContext = require("./db-context")
const DbApi = require("./db-api")

test("create page (db)", async () => {
  const store = memdown()
  const db = levelup(encode(store, { valueEncoding: "json" }))

  // const ctx = new DbContext(memdown())
  // const api = new DbApi(ctx.db)
  const ctx = new DbContext(db)
  const api = new DbApi(db)
  const p = makeProcessor(ctx)

  const dd = await p(
    "<p>dudu <a href='cnt?hop'>Cnt</a>",
    "joe",
    "newpage",
    true
  )

  await ctx.processBatch(dd.wholeBatch)

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

  const zzz = await api.allPages()
  expect(zzz.length).toBe(2)
  await ctx.close()
})
