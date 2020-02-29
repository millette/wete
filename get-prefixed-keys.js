"use strict"

// npm
const { toArray } = require("streamtoarray")

const getPrefixedKeys = async (elDb, prefix = 0) => {
  if (!elDb) throw new Error("Missing args.")

  const gt = prefix ? [prefix, ""].join(":") : "_"
  const lt = prefix ? [prefix, "\ufff0"].join(":") : "\ufff0"

  const len = prefix && prefix.length + 1
  const slicer = (id) => id.slice(len)
  const str = await elDb.createKeyStream({ gt, lt })
  const arr = await toArray(str)
  return arr.map(slicer)
}

module.exports = getPrefixedKeys
