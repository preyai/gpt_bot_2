import * as dotenv from "dotenv"
import { client } from "./discord.js"
import { generateDependencyReport } from "@discordjs/voice"
import getJwt from "./libs/getJwt.js"
import getAIM from "./libs/getAIM.js"
import { addChanel, getChanel, prepair } from "./db.js"

async function main() {
    // читаем .env
    dotenv.config()

    const token = process.env.TOKEN

    // запускаем бота
    await client.login(token)

    // console.log(generateDependencyReport());

    getJwt()
        .then(async r => {
            process.env["YANDEX_TOKEN"] = await getAIM(r)
        })

    prepair()

    setInterval(() => getJwt()
        .then(async r => {
            process.env["YANDEX_TOKEN"] = await getAIM(r)
        }), 1000 * 60 * 60 * 10)
}

main()