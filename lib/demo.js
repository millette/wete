"use strict"

// npm
const reporter = require("vfile-reporter")

// self
const { Context, makeProcessor } = require("./utils")

const info = (ddde) => {
  ddde.forEach((ddd) => {
    console.log(reporter(ddd))
    console.log(JSON.stringify(ddd.data, null, 2))
    console.log(ddd.toString())
    console.log()
  })
  return ddde
}

const addPages = async () => {
  const ctx = new Context()

  const p = makeProcessor(ctx)

  const aa = await p("bobo-cnt", "bob", "home")

  // const aa2 = await p("bobo-cnt", "bob", "home")
  // const bb = await p("dudu-cnt", "joe", "sandbox")
  // info(bb)

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

  const dd1 = dd.get("/newpage")

  const dd2 = await p("<p>dudu <a href='home'>Cnt</a>", "joe", dd1)
  info(dd2)
}

addPages().catch(console.error)
