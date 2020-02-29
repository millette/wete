"use strict"

// core
const fs = require("fs").promises

// npm
const level = require("level")
const reporter = require("vfile-reporter")

// self
const makeProcessor = require("./make-processor")
const getPrefixedKeys = require("./get-prefixed-keys")

const db = level("db", {
  valueEncoding: "json",
})

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
