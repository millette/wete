"use strict"

// self
// const getPrefixedKeys = require("./get-prefixed-keys")

// npm
const level = require("level")
const { toArray } = require("streamtoarray")

const db = level("db", {
  valueEncoding: "json",
})

const lala = async () => {
  const x = await db.createKeyStream()
  const y = await toArray(x)
  console.log(y)
}

lala().catch(console.error)
