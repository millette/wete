"use strict"

const maxSpread = 222 // 255 (ÿ) - 33 (!)

const calcSpread = (str) => {
  const sorted = str.split("").sort()
  const first = sorted.slice(0)[0].charCodeAt()
  const last = sorted.slice(-1)[0].charCodeAt()
  return last - first
}

const calcScore = (pw) => {
  if (!pw || pw.length < 8) return 0
  const n0 = pw.length / 7
  const n1 = calcSpread(pw) / maxSpread
  const len = Math.ceil(pw.length / 2)
  const p1 = pw.slice(0, len)
  const p2 = pw.slice(len)
  const half = maxSpread / 2
  const n2 = calcSpread(p1) / half
  const n3 = calcSpread(p2) / half
  return n0 * n1 * n2 * n3
}

module.exports = (pw) => calcScore(pw) > 0.1
