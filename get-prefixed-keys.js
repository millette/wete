"use strict"

// npm
const { toArray } = require("streamtoarray")

const getPrefixedKeys = async (elDb, prefix = "") => {
  if (!elDb) throw new Error("Missing args.")
  const len = prefix.length + 1
  const slicer = (id) => `/${id.slice(len)}`
  const str = await elDb.createKeyStream({
    gt: [prefix, ""].join(":"),
    lt: [prefix, "\ufff0"].join(":"),
  })
  const arr = await toArray(str)
  return arr.map(slicer)
}

module.exports = getPrefixedKeys
