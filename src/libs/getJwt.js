import * as dotenv from "dotenv"
import { readFileSync } from "fs"
import pkg from 'node-jose'
const { JWK, JWS } = pkg

dotenv.config()
const key = readFileSync('./close.pem')

const serviceAccountId = process.env.YANDEX_SERVICE_ACCOUNT_ID
const keyId = process.env.YANDEX_KEY_ID
const now = Math.floor(new Date().getTime() / 1000)

const payload = {
    aud: "https://iam.api.cloud.yandex.net/iam/v1/tokens",
    iss: serviceAccountId,
    iat: now,
    exp: now + 3600
}

async function getJWT() {
    const result = await JWK.asKey(key, 'pem', { kid: keyId, alg: 'PS256' })

    return JWS.createSign({ format: 'compact' }, result)
        .update(JSON.stringify(payload))
        .final()

}

export default getJWT