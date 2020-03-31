"use strict"

const diff = (a, b) => {
  const ret = new Map()
  a.forEach((x) => b.indexOf(x) === -1 && ret.set(x, "removed"))
  b.forEach((x) => a.indexOf(x) === -1 && ret.set(x, "added"))
  const out = {}
  ret.forEach((k, v) => {
    if (!out[k]) out[k] = []
    out[k].push(v)
  })

  return out
}

module.exports = diff
