"use strict"

// self
const trFile = require(".")

// npm
const report = require("vfile-reporter")

const contents = `[le link](/){data-embed}

The _thing_ it's.
`

// trFile("content/i2.md")
trFile({ path: "i2.md", contents })
  .then((f) => {
    console.log(f.history)
    console.log(report(f))
  })
  .catch((ee) => console.error("EEEE", ee))
