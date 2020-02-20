// ECDSA P-256

// const za = (key) => window.crypto.subtle.exportKey("jwk", key)

const run = () =>
  window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  )
// .then(({ publicKey, privateKey }) => Promise.all([za(publicKey), za(privateKey)]))

export default run
