"use strict"

// npm
const reporter = require("vfile-reporter")

// self
const makeProcessor = require("./utils")
const DbContext = require("./db-context")

const info = (ddde) => {
  console.log("wholeBatch", ddde.wholeBatch)
  ddde.docs.forEach((ddd) => {
    console.log(reporter(ddd))
    console.log(JSON.stringify(ddd.data, null, 2))
    console.log(ddd.toString())
    console.log()
  })
  return ddde
}

const addPages = async () => {
  const ctx = new DbContext("db-v1")

  const p = makeProcessor(ctx)

  const aa = await p("bobo-cnt", "bob", "home", true)

  await ctx.processBatch(aa.wholeBatch)

  // await p("bobo-cnt", "bob", "home")

  // const aa2 = await p("bobo-cnt", "bob", "home")
  // const bb = await p("dudu-cnt", "joe", "sandbox")
  // info(bb)

  // const cc = await p("niet-cnt", "joe", "niet")
  // info(cc)

  // const now = Date.now()
  const dd = await p(
    "<p>dudu v0 <a href='cnt?hop'>Cnt</a>",
    "joe",
    "newpage",
    true
  )
  // console.log("DD", Date.now() - now)

  await ctx.processBatch(dd.wholeBatch)
  info(dd)

  // const dd1 = dd.docs.get("/newpage")

  // const dd2 = await p("<p>dudu <a href='home'>Cnt</a>", "joe", dd1)
  const dd2 = await p("<p>dudu v1 <a href='home'>Cnt</a>", "joe", "/newpage")
  await ctx.processBatch(dd2.wholeBatch)
  info(dd2)

  const dd3 = await p("<p>dudu v2 <a href='home'>Cnt</a>", "joe", "/newpage")
  await ctx.processBatch(dd3.wholeBatch)
  info(dd3)

  await ctx.close()
}

addPages().catch(console.error)
