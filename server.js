"use strict"

// core
const fs = require("fs").promises

// self
const tad = require("./tadam")

// npm
require("dotenv-safe").config()
const fastify = require("fastify")({
  logger: true,
})

fastify.register(require("fastify-compress"))

fastify.register(require("fastify-cookie"), {
  secret: process.env.SECRET,
})

fastify.register(require("fastify-static"), {
  root: [__dirname, "dist"].join("/"),
})

// FIXME: match automatically with parcel filenames
const staticPaths = {
  "style.css": process.env.CSS,
  "main.js": process.env.JS,
}

fastify.setErrorHandler((error, request, reply) => {
  // console.log("GOT ERROR", error)
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

fastify.get("/", (request, reply) => reply.send("hi"))

fastify.post("/:page", async (request, reply) => {
  const connected = reply.unsignCookie(request.cookies.connected || "")
  if (!connected) {
    reply.code(401)
    throw new Error("Please login")
  }
  const page = request.params.page
  const len = request.body.cnt && request.body.cnt.length
  return { page, len, my: "me", connected }
})

fastify.post("/api/login", async (request, reply) => {
  const name = request.body.name
  const password = request.body.password

  if (password !== "ok") {
    reply.code(401)
    throw new Error("Credentials don't match.")
  }

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
  const cnt = await fs.readFile(`${page}.html`)
  reply.type("text/html")
  return tad(`${page} - wete`, page, cnt)
})

// Run the server!
fastify.listen(3000, function(err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
