"use strict"

// self
const getPrefixedKeys = require("./get-prefixed-keys")

// npm
const level = require("level")

const db = level("db", {
  valueEncoding: "json",
})

const lala = () => getPrefixedKeys(db, "page")

lala()
  .then(console.log)
  .catch(console.error)
