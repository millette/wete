"use strict"

const kaput = (e) => {
  console.error("KAPUT")
  console.error(e)
}

// self
const init = require("./init")

init()
  .then(() => {
    // self
    const makeProcessor = require("./utils")
    const DbContext = require("./db-context")
    const DbApi = require("./db-api")
    const tad = require("./tadam")

    const checkUserPassword = async (request, reply) => {
      return request.body.name
      /*
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
      */
    }

    const fastify = require("fastify")({
      logger: true,
    })

    fastify.register(require("fastify-compress"))

    fastify.register(require("fastify-leveldb"), {
      // name: "db-web-v123a", // : "db-web-v666", // db-web-v1
      name: process.env.DB,
      options: {
        valueEncoding: "json",
      },
    })

    fastify.after(() => {
      const api = new DbApi(fastify.level)
      const ctx = new DbContext(fastify.level)

      return api.pageLatest("wiki").catch(() => {
        const p = makeProcessor(ctx)
        return p(
          "<p>Welcome to wete wiki. There's a <a href='/sandbox'>sandbox</a>.</p>",
          "admin",
          "wiki",
          true
        ).then(({ wholeBatch }) => ctx.processBatch(wholeBatch))
      })
    })

    fastify.register(require("fastify-cookie"), {
      // secret: "abc123abc123",
      secret: process.env.SECRET,
    })

    fastify.register(require("fastify-formbody"))

    fastify.register(require("fastify-static"), {
      root: [__dirname, "dist"].join("/"),
      prefix: "/static/",
    })

    fastify.post("/api/login", async (request, reply) => {
      const name = await checkUserPassword(request, reply)
      reply.setCookie("connected", name, {
        signed: true,
        path: "/",
      })
      return { name, hi: "there" }
    })

    fastify.get("/favicon.ico", (request, reply) =>
      reply.code(404).send("Not found.")
    )

    fastify.get("/", async (request, reply) => {
      const api = new DbApi(fastify.level)
      const pages = await api.allPages()

      const list = pages.map(({ key }) => {
        const p = key.split(":")[1]
        return `<li><a href="/${p}">${p}</a></li>`
      })

      reply.type("text/html")
      const contents = `<h2>All pages</h2><ul>${list.join(
        ""
      )}</ul><p>See also <a href="/_recent">recent changes</a>.</p>`

      return tad("", "Home - wete", "Home", contents)
    })

    fastify.get("/_recent", async (request, reply) => {
      const api = new DbApi(fastify.level)
      const pages = await api.recentChanges()
      reply.type("text/html")

      const list = pages.map(({ key, value }) => {
        const [bah, ts, page] = key.split(":")
        return `<li><a href="/${page}">${page}</a>, ${new Date(
          parseInt(ts, 10)
        ).toUTCString()} by <code>${value}</code></li>`
      })

      const title = "Recent changes"
      const contents = `<h2>${title}</h2><ul>${list.join("")}</ul>`
      return tad("", `${title} - wete`, title, contents)
    })

    fastify.get("/_history/:page", async (request, reply) => {
      const api = new DbApi(fastify.level)
      const page = request.params.page
      const zzz = await api.pageVersions(page)
      reply.type("text/html")

      const creator = zzz[0].value.creator
      const ts = zzz[0].value.createdAt

      const title = `${zzz[0].value.title} history`
      let contents = `<h2>${title}</h2>
      <h3>Created by <code>${creator}</code>, ${new Date(ts).toUTCString()}</h3>
      <ol>${zzz
        .map(({ value }) => {
          return `<li>${new Date(value.updatedAt).toUTCString()} by <code>${
            value.editor
          }</code>; ${value.contents.length} bytes</li>`
        })
        .join("")}
      </ol>
      `
      return tad(page, `${title} - wete`, title, contents)
    })

    fastify.get("/_backlinks/:page", async (request, reply) => {
      const api = new DbApi(fastify.level)
      const page = request.params.page
      const zzz = await api.pageBacklinks(page)
      reply.type("text/html")

      const title = `Backlinks to ${page}`
      const contents = `<h2>${title}</h2><ul>
      ${zzz
        .map(({ key, value }) => {
          const k3 = key.split(":")[2]
          return `<li><a href="/${k3}">${k3}</a>, ${new Date(
            value.date
          ).toUTCString()} by <code>${value.editor}</code></li>`
        })
        .join("")}
      </ul>`
      return tad(page, `${title} - wete`, title, contents)
    })

    fastify.get("/_edit/:page", async (request, reply) => {
      const api = new DbApi(fastify.level)
      const page = request.params.page
      const zzz = await api.pageLatest(page)
      reply.type("text/html")
      const ret = `<nav style="width: 15rem; display: flex"><a style="flex: auto" href="/">/</a><a style="flex: auto" href="/${page}">v</a><a style="flex: auto" href="/_edit/${page}">ed</a><a style="flex: auto" href="/_backlinks/${page}">bl</a></nav>
    <form method="post" action="/${page}">
    <textarea name="cnt">${zzz.value.contents}</textarea>
    <button type="submit">Save</button>
    </form>
    `
      return ret
    })

    fastify.post("/:page", async (request, reply) => {
      const connected = reply.unsignCookie(request.cookies.connected || "")
      if (!connected) {
        reply.code(401)
        throw new Error("Please login")
      }

      const page = request.params.page
      const bod = request.body.cnt
      if (!bod) throw new Error("Missing content.")

      const ctx = new DbContext(fastify.level)
      const p = makeProcessor(ctx)
      const dd = await p(bod, connected, page)
      await ctx.processBatch(dd.wholeBatch)
      const d1 = dd.docs.get(`/${page}`)
      const bod2 = d1.toString()

      if (request.headers["content-type"] === "application/json")
        return { page, len: bod2.length, connected }
      reply.redirect(303, `/${page}`)
    })

    fastify.get("/:page", async (request, reply) => {
      const n = Date.now()
      const api = new DbApi(fastify.level)
      const page = request.params.page
      const zzz = await api.pageLatest(page)
      reply.type("text/html")
      return tad(page, `${page} - wete`, page, zzz.value.contents)
    })

    /*
    fastify.post("/api/login", async (request, reply) => {
      const name = await checkUserPassword(request, reply)
      reply.setCookie("connected", name, {
        signed: true,
        path: "/",
      })
      return { name, hi: "there" }
    })
    */

    fastify.listen(3000, function (err, address) {
      if (err) {
        fastify.log.error(err)
        process.exit(1)
      }
      fastify.log.info(`server listening on ${address}`)
    })
  })
  .catch(kaput)
