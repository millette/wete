"use strict"

// core
const fs = require("fs").promises

// npm
const { nanoid } = require("nanoid")
const freshTemplate = require("./init-template")
const freshCss = require("./init-css")
const freshJs = require("./init-js")
const des = require("dotenv-safe") // .config()

const config = async () => {
  try {
    console.log("config...")
    des.config()
    console.log("config is ok")
  } catch (e) {
    console.error("MISSING:", e.missing)
    e.missing.forEach((v) => {
      switch (v) {
        case "DB":
          process.env.DB = "db-web-v3.0.0"
          break

        case "SECRET":
          process.env.SECRET = nanoid(32)
          break

        default:
          throw e
      }
    })

    await fs.writeFile(
      ".env",
      `DB=${process.env.DB}
SECRET=${process.env.SECRET}
`,
      "utf-8"
    )
    console.log("config written")
  }
}

const init = async () => {
  await config()
  console.log("Fresh js...")
  await freshJs()
  console.log("Fresh template and css...")
  return Promise.all([freshTemplate(), freshCss()])
}

module.exports = init
