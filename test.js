"use strict"

const fofo = require("./fofo")

test.skip("create page", async () => {
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

test("update page", async () => {
  const oldDoc = await fofo.updatePage({
    updatedAt: 1583447300000,
    editor: "bob",
    pathname: "/",
    contents: "<p>Hello world",
  })

  const {
    data: { creator, createdAt, updatedAt },
    contents,
  } = await fofo.updatePage(
    {
      contents: "<p>Hello <i>world",
      editor: "joe",
      pathname: "",
    },
    oldDoc
  )

  expect(contents).toBe("<p>Hello <i>world</i></p>")
  expect(creator).toBe(oldDoc.data.editor)
  expect(createdAt).toBe(oldDoc.data.updatedAt)
  expect(updatedAt > createdAt).toBeTruthy()
})
