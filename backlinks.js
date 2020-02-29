"use strict"

// core
const fs = require("fs").promises

// npm
const level = require("level")
const { toArray } = require("streamtoarray")
const reporter = require("vfile-reporter")

// self
// const yaya = require("./yaya")
const makeProcessor = require("./make-processor")

const db = level("db", {
  valueEncoding: "json",
})

const getPrefixedKeys = async (elDb, prefix) => {
  if (!prefix || !elDb) throw new Error("Missing args.")
  const len = prefix.length + 1
  const slicer = (id) => `/${id.slice(len)}`
  const str = await elDb.createKeyStream({
    gt: [prefix, ""].join(":"),
    lt: [prefix, "\ufff0"].join(":"),
  })
  const arr = await toArray(str)
  return arr.map(slicer)
}

const run = async () => {
  // const contents = await fs.readFile("written/wiki.html", "utf-8")
  const contents = await fs.readFile("written/ikiw.html", "utf-8")

  const allPages = await getPrefixedKeys(db, "page")

  console.log("allPages:", allPages)

  // const { cnt: contents, ...oy } = await db.get(["page", "ikiw"].join(":"))
  const oy = { internalLinks: [], externalLinks: [] }
  console.log("original size", contents.length)

  console.log(oy)
  if (!oy.internalLinks) oy.internalLinks = []
  if (!oy.externalLinks) oy.externalLinks = []

  const processor = makeProcessor(allPages)
  const vfout = await processor({ pathname: "/ikiw", contents })

  console.log(reporter(vfout))
  // console.log(vfout)
  console.log("output size", vfout.contents.length)
  console.log(JSON.stringify(vfout.data.yaya, null, 2))
  // console.log(vfout.data.yaya.externalLinks[0].properties.href)
}

run().catch(console.error)
