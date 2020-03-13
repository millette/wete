"use strict"

// npm
const reporter = require("vfile-reporter")

// self
const { Context, makeProcessor } = require("./utils")

const info = (ddde) => {
  ddde.forEach((ddd) => {
    // console.log("INFO", ddd.path)
    // console.log(JSON.stringify(ddd.data, null, 2))
    // console.log(ddd.toString())
    console.log(reporter(ddd) + "\n")
  })
  return ddde
}

const addPages = async () => {
  const ctx = new Context()

  const p = makeProcessor(ctx)

  /*
  const aa = await p("bobo-cnt", "bob", "home")
  info(aa)


  const bb = await p("dudu-cnt", "joe", "sandbox")
  info(bb)
  */

  // const cc = await p("niet-cnt", "joe", "niet")
  // info(cc)

  // const now = Date.now()
  const dd = await p(
    "<p>dudu <a href='cnt?hop'>Cnt</a>",
    "joe",
    "newpage",
    true
  )
  // console.log("DD", Date.now() - now)
  info(dd)
}

addPages().catch(console.error)
