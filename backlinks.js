"use strict"

// core
// const fs = require("fs").promises

// npm
const level = require("level")
const reporter = require("vfile-reporter")

// self
const makeProcessor = require("./make-processor")
const getPrefixedKeys = require("./get-prefixed-keys")

const db = level("db", {
  valueEncoding: "json",
})

const run = async (pathname) => {
  // const contents = await fs.readFile(["written", pathname, ".html"].join(""), "utf-8")

  const allPages0 = await getPrefixedKeys(db, "page")
  const allPages = allPages0.map((id) => `/${id}`)

  console.log("allPages:", allPages)

  const { cnt: contents, ...oy } = await db.get(
    ["page", pathname.slice(1)].join(":")
  )
  // const oy = { internalLinks: [], externalLinks: [] }
  console.log("original size", contents.length, oy)

  console.log(oy)
  if (!oy.internalLinks) oy.internalLinks = []
  if (!oy.externalLinks) oy.externalLinks = []

  /*
  oy.internalLinks.push({
    href: "/wiki#tada",
    page: "/wiki",
    text: "rah rah"
  })
  */

  const processor = makeProcessor(allPages)
  const vfout = await processor({ pathname, contents })

  console.log(reporter(vfout))
  // console.log(vfout)
  console.log("output size", vfout.contents.length)
  // console.log(JSON.stringify(vfout.data.yaya, null, 2))
  // console.log(vfout.data.yaya.externalLinks[0].properties.href)

  const deletedBacklinks = []

  oy.internalLinks.forEach((obj) => {
    // console.log("DELETED?", obj)
    if (
      vfout.data.yaya.internalLinks
        .filter(({ missing }) => !missing)
        .map(({ page }) => page)
        .indexOf(obj.page) === -1
    )
      deletedBacklinks.push(
        ["backlink", obj.page.slice(1), pathname.slice(1)].join(":")
      )
  })

  const newLinks = []
  const newBacklinks = []

  vfout.data.yaya.internalLinks.forEach(({ missing, ...obj }) => {
    // console.log("NEW???", missing, obj)
    newLinks.push(obj)
    if (
      !missing &&
      oy.internalLinks.map(({ page }) => page).indexOf(obj.page) === -1
    )
      newBacklinks.push(
        ["backlink", obj.page.slice(1), pathname.slice(1)].join(":")
      )
  })
  // vfout.data.yaya.internalLinks = newLinks
  // console.log('vfout', JSON.stringify(vfout, null, 2))
  // console.log('newBacklinks', newBacklinks)

  const date = Date.now()
  const version = ["page-version", pathname.slice(1), date].join(":")
  const newDoc = {
    ...oy,
    cnt: vfout.contents,
    internalLinks: newLinks,
    externalLinks: vfout.data.yaya.externalLinks,
    date,
    // connected: oy.connected
  }

  const batch = newBacklinks.map((key) => ({
    key,
    value: true,
    type: "put",
  }))

  deletedBacklinks.forEach((x) => {
    const zo = {
      key: x,
      type: "del",
    }
    // console.log("ZO", zo)
    batch.push(zo)
  })

  batch.push({
    type: "put",
    key: ["page", pathname.slice(1)].join(":"),
    value: {
      ...newDoc,
      version,
    },
  })

  batch.push({
    type: "put",
    key: version,
    value: newDoc,
  })

  // console.log("batch", JSON.stringify(batch, null, 2))
  return db.batch(batch)
}

// run("/ikiw").catch(console.error)
// run("/wiki").catch(console.error)
run("/todo").catch(console.error)
