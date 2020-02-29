"use strict"

// core
const fs = require("fs").promises

// self
const tad = require("./tadam")

// npm
require("dotenv-safe").config()
// FIXME: match automatically with parcel filenames
const staticPaths = {
  "style.css": process.env.CSS,
  "main.js": process.env.JS,
}

// FIXME: hashing, of course
const checkUserPassword = async (request, reply) => {
  try {
    const name = request.body.name
    const { password } = await fastify.level.get(["_user", name].join(":"))
    if (password === request.body.password) return name
    throw new Error("Credentials don't match.")
  } catch (e) {
    fastify.log.error(e)
    reply.code(401)
    throw new Error("Credentials don't match.")
  }
}

const fastify = require("fastify")({
  logger: true,
})

fastify.register(require("fastify-compress"))
fastify.register(require("fastify-leveldb"), {
  name: "db",
  options: {
    valueEncoding: "json",
  },
})

fastify.register(require("fastify-cookie"), {
  secret: process.env.SECRET,
})

fastify.register(require("fastify-static"), {
  root: [__dirname, "dist"].join("/"),
})

fastify.setErrorHandler((error, request, reply) => {
  if (error.code === "ENOENT") return reply.code(404).send(error)
  if (error.statusCode >= 500) {
    fastify.log.error(error)
  } else if (error.statusCode >= 400) {
    fastify.log.info(error)
  } else {
    fastify.log.error(error)
  }
  reply.send(error)
})

fastify.get("/favicon.ico", (request, reply) =>
  reply.code(404).send("Not found.")
)

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

// Run the server!
fastify.listen(3000, function(err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
