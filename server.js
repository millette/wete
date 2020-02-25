"use strict"

// core
const fs = require("fs").promises

// self
const tad = require("./tadam")

// npm
const fastify = require("fastify")()
fastify.register(require("fastify-cookie"))
fastify.register(require("fastify-static"), {
  root: [__dirname, "dist"].join("/"),
})

const staticPaths = {
  "style.css": "style.044f2d48.css",
  "main.js": "main.707d6e68.js",
}

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

fastify.get("/", (request, reply) => {
  console.log(request.headers.cookie)
  console.log("conn", request.cookies.connected)
  reply.send("hi")
})

fastify.get("/static/:path", (request, reply) => {
  if (staticPaths[request.params.path])
    return reply.sendFile(staticPaths[request.params.path])
  reply.code(404).send("Not found.")
})

/*
fastify.get("/style.css", (request, reply) => {
  reply.sendFile("style.044f2d48.css")
})

fastify.get("/main.js", (request, reply) => {
  reply.sendFile("main.707d6e68.js")
})
*/

fastify.get("/:page", async (request, reply) => {
  const page = request.params.page
  const cnt = await fs.readFile(`${page}.html`)
  reply.type("text/html")
  return tad(`${page} - wete`, `${page} - wete`, cnt)
})

// Run the server!
fastify.listen(3000, function(err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
