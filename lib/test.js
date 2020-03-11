"use strict"

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

  console.log("DD", dd)
  expect(dd instanceof Vfile).toBeTruthy()
  expect(dd.data.internalLinks.length).toBe(1)

  expect(dd.toString()).toBe(`<p>dudu <a href="/cnt?hop">Cnt</a></p>`)

  // expect(dd.data.internalLinks[0].stub).toBeTruthy()
})

test("update page", async () => {
  const ctx = new Context()

  const p = makeProcessor(ctx)

  const dd = await p("bobo-cnt", "bob", "home")
  expect(dd instanceof Vfile).toBeTruthy()
  expect(dd.data.internalLinks).toBeFalsy()
  expect(dd.data.editOf).toBeTruthy()
})

/*
test("create page", async () => {
  const doc = {
    editor: "bob",
    pathname: "",
    contents: "<p>Hello world",
  }

  const ddd = await fofo.updatePage(doc)
  const {
    data: { creator, createdAt, updatedAt },
    pathname,
    contents,
  } = ddd

  // console.log("DDD", ddd)
  expect(contents).toBe("<p>Hello world</p>")
  expect(creator).toBe(doc.editor)
  expect(createdAt).toBeTruthy()
  expect(createdAt).toBe(updatedAt)
  expect(pathname).toBe("/")
})
*/

/*
test("update page", async () => {
  const oldDoc = await fofo.updatePage({
    updatedAt: 1583447300000,
    editor: "bob",
    pathname: "/",
    contents: "<p>Hello world",
  })

  const newDoc = await fofo.updatePage(
    {
      contents: "<p>Hello <i>world",
      editor: "joe",
      pathname: "",
    },
    oldDoc
  )
  const {
    data: { editOf, creator, createdAt, updatedAt },
    contents,
  } = newDoc

  const asBatch = fofo.doit(newDoc)
  // console.log("NEWDOC", fofo.doit(newDoc))

  expect(contents).toBe("<p>Hello <i>world</i></p>")
  expect(creator).toBe(oldDoc.data.editor)
  expect(editOf).toBe(oldDoc.data.updatedAt)
  expect(createdAt).toBe(oldDoc.data.updatedAt)
  expect(updatedAt > createdAt).toBeTruthy()

  expect(asBatch.length).toBe(3)
  expect(asBatch[0].key).toBe(asBatch[1].value)
  expect(asBatch[1].key).toBe("page:")
})
*/

/*
test("update links", async () => {
  const oldDoc = await fofo.updatePage({
    updatedAt: 1583447300000,
    editor: "bob",
    pathname: "/",
    contents: "<p>Hello <a href='world'>world</a>",
  })

  const o2 = fofo.doit(oldDoc)
  // console.log("oldDoc", JSON.stringify(oldDoc, null, 2))
  // console.log("o2", JSON.stringify(o2, null, 2))

  const newDoc = await fofo.updatePage(
    {
      contents: "<p>Hello <i>world",
      editor: "joe",
      pathname: "",
    },
    oldDoc
  )
  const {
    data: { editOf, creator, createdAt, updatedAt },
    contents,
  } = newDoc

  const asBatch = fofo.doit(newDoc)
  // console.log("newDoc", JSON.stringify(newDoc, null, 2))
  // console.log("asBatch", JSON.stringify(asBatch, null, 2))

})
*/

/*
test("createStub", async () => {
  const oldDoc = await fofo.updatePage({
    updatedAt: 1583447300000,
    editor: "bob",
    pathname: "/",
    contents: "<p>Hello <a href='world'>world</a>",
  })

  const z3 = fofo.doit(oldDoc)
  expect(z3.length).toBe(3)

  // console.log("Z3", JSON.stringify(z3, null, 2))

  const z = await fofo.createStub("world", oldDoc)
  const z2 = fofo.doit(z)
  // console.log("Z2", JSON.stringify(z2, null, 2))

  expect(z2.length).toBe(2)
})
*/
