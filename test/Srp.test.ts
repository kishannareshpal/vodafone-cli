import { describe, expect, it } from "@effect/vitest"

import { createClientChallenge, createClientProof, routerUsername } from "../src/router/Srp.js"

const serverPublicKey = [
  "9f4c16d3a8b5720ecb75eaa3410fd9421da48f623cf8d571a6cf09f78ed6750d1e9d75bc5efae1c0",
  "db72467a6815bb7d8a19ccdf476220f907c3941e3a4e861b4dbe022dfd70cf058e317e8207f7ecb",
  "3f05c31f3366f79db2a3995d21f5376a126a6a9c4bf2f6bd255f5e8a04f72c87bfbf0e0d712a",
  "6077d25a2f4b132895c6c45f66b7ed7d141403ecb60d3b3ca49194751f8ebfa87942e8fe3d",
  "3d917387f6957c78c5ecf4e11e84d5697ac371fd031295d3467d57dc3fcd9eb5cd3f2097ee05",
  "d9c525a1ccf0b7137b10ee202cdd0c9c53928333b8e6e7a9de27d437539bb5"
].join("")

describe("Srp", () => {
  it("creates deterministic client challenges when a private key is provided", () => {
    expect(createClientChallenge(1n).publicKey).toBe("02")
  })

  it("computes the router SRP client proof and expected server proof", () => {
    const challenge = createClientChallenge(123456789n)
    const proof = createClientProof({
      password: "secret-password",
      privateKey: challenge.privateKey,
      publicKey: challenge.publicKey,
      salt: "b8f0e6d17f2a4c0e",
      serverPublicKey,
      username: routerUsername
    })

    expect(challenge.publicKey).toBe(
      [
        "840b739de970ad2f7be5e6b41fae9a141ca87754e37320e3a3a35bda163dd8f3297766080e4d1a",
        "7a5d3321466d983ed86abe5c48399fecedc41de395d626e9ea1c219ea2b65c4b3c7b94aa1d9af",
        "4ef297d42e91317eef266dc1d710c70bb7769f3a144d77578789591b4d4d718cc2102372223685d",
        "81a4b8d8127140dde103aafb6312bcdc10d11a0aaeaecb39d6e542bf9cd263897f313f6d5b",
        "978c8afa35dd10d9e9ab6d9aa0285c5679c7b831a18f99d8954ae77a7b39733fda8e347",
        "fa84d64adc1825a397b94a8010d5fa00705998d68a7ae09771f3f5361a9aed56d26b3ad",
        "076c6b7d3ec2b606b1f53ac32c6710609d6d0229a8e9a4e1cc5b37388e3153"
      ].join("")
    )
    expect(proof.proof).toBe("fd22837db8b5121461a7628150a16fc5769ba97aee9c2b97c1392db7f4d242fe")
    expect(proof.expectedServerProof).toBe("e463085ac609f0b0f121af0f104da5318e2eb8b4d72bbda0ee14854246061d5c")
  })
})
