"use strict"

// self
const trFile = require(".")

// npm
const report = require("vfile-reporter")

const contents = `[le link](/){data-embed}

The _thing_ it's.
`

trFile({ path: "content/i666.md", contents })
  .then((f) => {
    console.log(1, f.history)
    console.log(report(f))
  })
  .catch((ee) => console.error("EEEE1", ee))

trFile("content/i2.md")
  .then((f) => {
    console.log(2, f.history)
    console.log(report(f))
  })
  .catch((ee) => console.error("EEEE2", ee))

trFile("content/i2.md")
  .then((f) => {
    console.log(3, f.history)
    console.log(report(f))
  })
  .catch((ee) => console.error("EEEE3", ee))
