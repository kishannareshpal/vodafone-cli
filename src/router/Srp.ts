import { createHash, randomBytes } from "node:crypto"

export const routerUsername = "vodafone"

const modulusHex =
  "ac6bdb41324a9a9bf166de5e1389582faf72b6651987ee07fc3192943db56050a37329cbb4a099ed8193e0757767a13dd52312ab4b03310dcd7f48a9da04fd50e8083969edb767b0cf6095179a163ab3661a05fbd5faaae82918a9962f0b93b855f97993ec975eeaa80d740adbf4ff747359d041d5c33ea71d281e446b14773bca97b43a23fb801676bd207a436c6481f1d2b9078717461a5b9d32e688f87748544523b524b0d57d5ea77a2775d2ecfa032cfbdbf52fb3786160279004e57ae6af874e7303ce53299ccc041c7bc308d82a5698f3a8d0c38271ae35f8e9dbfbb694b5c803d89f7ae435de236d525f54759b65e372fcd68ef20fa7111f9e4aff73"

const generator = 2n
const multiplier = BigInt("0x05b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300")
const modulus = BigInt(`0x${modulusHex}`)
const modulusBytes = 256
const proofPrefix = "4a76a9a2402bdd18123389b72ebbda50a30f65aedb90d7273130edea4b29cc4c"

export interface SrpClientChallenge {
  readonly privateKey: bigint
  readonly publicKey: string
}

export interface SrpClientProof {
  readonly proof: string
  readonly expectedServerProof: string
}

const evenHex = (value: string) => value.length % 2 === 0 ? value : `0${value}`

const hashBytes = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex")

const hashHex = (hex: string) => hashBytes(Buffer.from(evenHex(hex), "hex"))

const hashText = (value: string) => hashBytes(Buffer.from(value, "utf8"))

const toHex = (value: bigint) => evenHex(value.toString(16))

const toPaddedBytes = (value: bigint) => {
  const bytes = Buffer.from(toHex(value), "hex")

  if (bytes.length > modulusBytes) {
    return bytes.subarray(bytes.length - modulusBytes)
  }

  if (bytes.length === modulusBytes) {
    return bytes
  }

  return Buffer.concat([Buffer.alloc(modulusBytes - bytes.length), bytes])
}

const modPow = (base: bigint, exponent: bigint, mod: bigint) => {
  let result = 1n
  let currentBase = base % mod
  let currentExponent = exponent

  while (currentExponent > 0n) {
    if (currentExponent % 2n === 1n) {
      result = (result * currentBase) % mod
    }

    currentBase = (currentBase * currentBase) % mod
    currentExponent = currentExponent / 2n
  }

  return result
}

const positiveModulo = (value: bigint, mod: bigint) => {
  const result = value % mod
  return result >= 0n ? result : result + mod
}

export const createClientChallenge = (
  privateKey = BigInt(`0x${randomBytes(32).toString("hex")}`)
): SrpClientChallenge => {
  const publicKey = modPow(generator, privateKey, modulus)

  if (publicKey % modulus === 0n) {
    return createClientChallenge()
  }

  return {
    privateKey,
    publicKey: toHex(publicKey)
  }
}

export const createClientProof = (params: {
  readonly privateKey: bigint
  readonly publicKey: string
  readonly username: string
  readonly password: string
  readonly salt: string
  readonly serverPublicKey: string
}): SrpClientProof => {
  const publicKey = BigInt(`0x${params.publicKey}`)
  const serverPublicKey = BigInt(`0x${params.serverPublicKey}`)
  const scramble = BigInt(`0x${hashBytes(Buffer.concat([toPaddedBytes(publicKey), toPaddedBytes(serverPublicKey)]))}`)

  if (serverPublicKey % modulus === 0n || scramble === 0n) {
    throw new Error("Invalid SRP server challenge")
  }

  const identityHash = hashText(`${params.username}:${params.password}`)
  const privateVerifier = BigInt(`0x${hashHex(`${params.salt}${identityHash}`)}`)
  const verifierPublicKey = modPow(generator, privateVerifier, modulus)
  const base = positiveModulo(serverPublicKey - multiplier * verifierPublicKey, modulus)
  const exponent = params.privateKey + scramble * privateVerifier
  const sharedSecret = modPow(base, exponent, modulus)
  const sessionKey = hashHex(toHex(sharedSecret))
  const usernameHash = hashText(params.username)
  const proof = hashHex(
    `${proofPrefix}${usernameHash}${params.salt}${params.publicKey}${params.serverPublicKey}${sessionKey}`
  )

  return {
    proof,
    expectedServerProof: hashHex(`${params.publicKey}${proof}${sessionKey}`)
  }
}
