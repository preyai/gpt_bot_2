import * as dotenv from "dotenv"
import { createWriteStream, readFileSync, writeFile, writeFileSync } from "fs"
import { Readable } from "stream"

dotenv.config()
const folderId = process.env.YANDEX_FOLDER

async function stt(file) {
    const response = await fetch(`https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?topic=general&folderId=${folderId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.YANDEX_TOKEN}`
        },
        body: readFileSync(file)
    })

    const result = await response.json()
    return result
}

async function tts(text) {
    const body = new FormData()
    body.append('text', text)
    body.append('lang', 'ru-RU')
    body.append('voice', 'jane')
    body.append('folderId', folderId)

    const response = await fetch("https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.YANDEX_TOKEN}`
        },
        body
    })

    const fname = `./opus/y${new Date().getTime()}.ogg`
    const output = createWriteStream(fname)
    const stream = Readable.from(response.body)

    await new Promise((resolve, reject) => {
        stream.pipe(output)
            .on('finish', resolve)
            .on('error', reject)
    })

    return fname

}

export { stt, tts }