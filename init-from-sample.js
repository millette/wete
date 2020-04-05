"use strict"

// core
const fs = require("fs")
const fsp = fs.promises
const path = require("path")

const lala = (dest) => {
  const yo = path.parse(dest)
  return path.format({
    ...yo,
    base: undefined,
    name: `${yo.name}.sample`,
  })
}

const fromSample = (dest) =>
  fsp
    .copyFile(
      lala(dest),
      dest,
      fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE
    )
    .catch((e) => {
      if (e.code !== "EEXIST") throw e
    })

module.exports = fromSample
