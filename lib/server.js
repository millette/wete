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

fastify.get("/:page", async (request, reply) => {
  const api = new DbApi(fastify.level)
  const page = request.params.page
  const zzz = await api.pageLatest(page)
  // reply.type("application/json")
  // return { zzz, page }
  reply.type("text/html")
  return zzz.value.contents
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
fastify.listen(3000, function(err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
