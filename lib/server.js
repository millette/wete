"use strict"

// core
const fs = require("fs").promises

// self
const makeProcessor = require("./utils")
const DbContext = require("./db-context")
const DbApi = require("./db-api")

// npm
const Vfile = require("vfile")
// const memdown = require("memdown")
const fastify = require("fastify")({
  logger: true,
})

fastify.register(require("fastify-leveldb"), {
  name: "db-web-v1",
  options: {
    // store: require("memdown"),
    valueEncoding: "json",
  },
})

fastify.register(require("fastify-formbody"))

fastify.get("/favicon.ico", (request, reply) =>
  reply.code(404).send("Not found.")
)

fastify.get("/", async (request, reply) => {
  const api = new DbApi(fastify.level)
  // reply.type("application/json")
  const pages = await api.allPages()

  const list = pages.map(({ key }) => {
    const p = key.split(":")[1]
    return `<li><a href="/${p}">${p}</a></li>`
  })

  reply.type("text/html")
  return `<ul>${list.join("")}</ul>`
})

fastify.get("/_backlinks/:page", async (request, reply) => {
  const api = new DbApi(fastify.level)
  const page = request.params.page
  const zzz = await api.pageBacklinks(page)
  reply.type("text/html")
  const ret = `<nav style="width: 15rem; display: flex"><a style="flex: auto" href="/">/</a><a style="flex: auto" href="/${page}">v</a><a style="flex: auto" href="/_edit/${page}">ed</a><a style="flex: auto" href="_backlinks/${page}">bl</a></nav>
  <pre>${JSON.stringify(zzz, null, 2)}</pre>
  `
  return ret
})

fastify.get("/_edit/:page", async (request, reply) => {
  const api = new DbApi(fastify.level)
  const page = request.params.page
  const zzz = await api.pageLatest(page)
  reply.type("text/html")
  const ret = `<nav style="width: 15rem; display: flex"><a style="flex: auto" href="/">/</a><a style="flex: auto" href="/${page}">v</a><a style="flex: auto" href="/_edit/${page}">ed</a><a style="flex: auto" href="_backlinks/${page}">bl</a></nav>
  <form method="post" action="/${page}">
  <textarea name="cnt">${zzz.value.contents}</textarea>
  <button type="submit">Save</button>
  </form>
  `
  return ret
})

fastify.post("/:page", async (request, reply) => {
  const api = new DbApi(fastify.level)
  const page = request.params.page
  const bod = request.body.cnt
  // console.log(page, bod)

  const ctx = new DbContext(fastify.level)
  // const api = new DbApi(db)
  const p = makeProcessor(ctx)

  const dd = await p(bod, "joe", page)

  await ctx.processBatch(dd.wholeBatch)

  const d1 = dd.docs.get(`/${page}`)

  // console.log("D1", d1)
  const bod2 = d1.toString()

  reply.type("text/html")

  const ret = `<nav style="width: 15rem; display: flex"><a style="flex: auto" href="/">/</a><a style="flex: auto" href="/${page}">v</a><a style="flex: auto" href="/_edit/${page}">ed</a><a style="flex: auto" href="_backlinks/${page}">bl</a></nav>
  <div>${bod2}</div>
  `
  return ret

  // return "ok"
})

fastify.get("/:page", async (request, reply) => {
  const api = new DbApi(fastify.level)
  const page = request.params.page
  const zzz = await api.pageLatest(page)
  reply.type("text/html")
  const ret = `<nav style="width: 15rem; display: flex"><a style="flex: auto" href="/">/</a><a style="flex: auto" href="/${page}">v</a><a style="flex: auto" href="/_edit/${page}">ed</a><a style="flex: auto" href="_backlinks/${page}">bl</a></nav>
  <div>${zzz.value.contents}</div>
  `
  return ret
})

/*
fastify.get("/", async (request, reply) => {
  // reply.send("hi")

  const ok = await fastify.level.put("_user:bob", {
    fee: "foo",
    password: "yup",
  })
  console.log("BOB-put", ok)

  const bob = await fastify.level.get("_user:bob")
  console.log("BOB", bob)
  return "hi"
})

fastify.post("/api/login", async (request, reply) => {
  const name = await checkUserPassword(request, reply)
  reply.setCookie("connected", name, {
    signed: true,
    path: "/",
  })
  return { name, hi: "there" }
})

fastify.get("/static/:path", (request, reply) => {
  if (staticPaths[request.params.path])
    return reply.sendFile(staticPaths[request.params.path])
  reply.code(404).send("Not found.")
})

fastify.get("/:page", async (request, reply) => {
  const page = request.params.page
  // const cnt = await fs.readFile(`written/${page}.html`)
  const { date, connected, cnt } = await fastify.level.get(
    ["page", page].join(":")
  )
  console.log(date, connected, cnt.length)

  reply.type("text/html")
  return tad(`${page} - wete`, page, cnt)
})

fastify.post("/:page", async (request, reply) => {
  const connected = reply.unsignCookie(request.cookies.connected || "")
  if (!connected) {
    reply.code(401)
    throw new Error("Please login")
  }
  const page = request.params.page
  const cnt = request.body.cnt
  if (!cnt) throw new Error("Missing content.")
  // await fs.writeFile(`written/${page}.html`, cnt)
  await fastify.level.put(["page", page].join(":"), {
    date: Date.now(),
    connected,
    cnt,
  })
  return { page, len: cnt.length, connected }
})
*/

// Run the server!
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
