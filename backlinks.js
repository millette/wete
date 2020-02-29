"use strict"

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
  const allPages0 = await getPrefixedKeys(db, "page")
  const allPages = allPages0.map((id) => `/${id}`)

  console.log("allPages:", allPages)

  const { cnt: contents, ...oy } = await db.get(
    ["page", pathname.slice(1)].join(":")
  )
  console.log("original size", contents.length, oy)

  console.log(oy)
  if (!oy.internalLinks) oy.internalLinks = []
  if (!oy.externalLinks) oy.externalLinks = []

  const processor = makeProcessor(allPages)
  const vfout = await processor({ pathname, contents })

  console.log(reporter(vfout))
  console.log("output size", vfout.contents.length)

  const deletedBacklinks = []

  oy.internalLinks.forEach((obj) => {
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
    newLinks.push(obj)
    if (
      !missing &&
      oy.internalLinks.map(({ page }) => page).indexOf(obj.page) === -1
    )
      newBacklinks.push(
        ["backlink", obj.page.slice(1), pathname.slice(1)].join(":")
      )
  })

  const date = Date.now()
  const version = ["page-version", pathname.slice(1), date].join(":")
  const newDoc = {
    ...oy,
    cnt: vfout.contents,
    internalLinks: newLinks,
    externalLinks: vfout.data.yaya.externalLinks,
  }

  const type = "put"

  const batch = newBacklinks.map((key) => ({
    key,
    value: date,
    type,
  }))

  deletedBacklinks.forEach((key) => {
    const zo = {
      key,
      type: "del",
    }
    batch.push(zo)
  })

  batch.push({
    type,
    key: ["page", pathname.slice(1)].join(":"),
    value: {
      ...newDoc,
      version,
    },
  })

  batch.push({
    type,
    key: ["change", date, pathname.slice(1)].join(":"),
    value: true,
  })

  batch.push({
    type,
    key: version,
    value: newDoc,
  })

  // console.log("batch", JSON.stringify(batch, null, 2))
  return db.batch(batch)
}

run("/ikiw").catch(console.error)
// run("/wiki").catch(console.error)
// run("/todo").catch(console.error)
