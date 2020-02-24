"use strict"

// core
const fs = require("fs")

// self
const tad = require("./tadam")

// npm
const fastify = require("fastify")()
fastify.register(require("fastify-cookie"))

fastify.get("/", (request, reply) => {
  console.log(request.headers.cookie)
  console.log("conn", request.cookies.connected)
  reply.send("hi")
})

fastify.get("/style.css", (request, reply) => {
  reply.type("text/css").send(fs.readFileSync("dist/style.044f2d48.css"))
})

fastify.get("/main.js", (request, reply) => {
  reply
    .type("application/javascript")
    .send(fs.readFileSync("dist/main.707d6e68.js"))
})

fastify.get("/wiki", (request, reply) => {
  const ttt = tad("html title", "el page title", fs.readFileSync("wiki.html"))
  reply.type("text/html").send(ttt)
})

// Run the server!
fastify.listen(3000, function(err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
