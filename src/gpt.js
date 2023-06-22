import * as dotenv from "dotenv"
import { Configuration, OpenAIApi } from "openai"

dotenv.config()

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
})

const openai = new OpenAIApi(configuration)

async function ask(conversationLog) {
    const result = await openai
        .createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: conversationLog,
            // temperature: 1
            // max_tokens: 256, // limit token usage
        })
        .catch((error) => {
            console.log(`OPENAI ERR: ${error}`)
        })
    return result.data.choices[0].message
}

export { openai, ask }