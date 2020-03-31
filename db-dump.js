"use strict"

// npm
const level = require("level")

const db = level("db-v1", { valueEncoding: "json" })
// const db = level("db-v1")

const log = (x) => console.log(JSON.stringify(x))

db.createReadStream().on("data", log)
