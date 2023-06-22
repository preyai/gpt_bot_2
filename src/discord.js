import { ApplicationCommandOptionType, Client, Events, IntentsBitField } from "discord.js"
import invite from "./commands/invite.js"
import join from "./commands/join.js"
import { getChanel } from "./db.js"
import { ask } from "./gpt.js"

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates
    ],
})

client.on('ready', (c) => {
    console.log('The bot is online!')
    c.application.commands.create({
        name: "ask",
        type: 1,
        description: "ask me",
    })
    c.application.commands.create({
        name: "invite",
        type: 1,
        description: "invite to chanel",
    })
    c.application.commands.create({
        name: "join",
        type: 1,
        description: "invite to text chanel",
        options: [
            {
                name: "chanel",
                description: "Канал на который будет подписан бот",
                type: ApplicationCommandOptionType.Channel,
                required: true
            }
        ]
    })
})

client.on('messageCreate', async (message) => {
    if (message.author.bot) return
    const isFollow = await getChanel(message.channel.id)
    if (!isFollow) return
    if (message.content.startsWith('!')) return
    if (message.content.startsWith('/')) return

    let conversationLog = [{ role: 'system', content: 'Ты бот в чате discord. Ты очень саркастичен. В ответе должно быть хотя бы одно язвительное замечание' }]

    try {
        message.channel.sendTyping()
        const interval = setInterval(() => {
            message.channel.sendTyping()
        }, 10000)
        let prevMessages = await message.channel.messages.fetch({ limit: 20 })
        prevMessages.reverse()

        prevMessages.forEach((msg) => {
            if (msg.content.startsWith('!')) return
            if (msg.author.id !== client.user.id && message.author.bot) return

            conversationLog.push({
                role: msg.author.id == client.user.id ? 'assistant' : 'user',
                content: msg.content,
                name: msg.author.username
                    .replace(/\s+/g, '_')
                    .replace(/[^\w\s]/gi, ''),

            })
        })

        // conversationLog.splice(conversationLog.length - 2, 0, { role: 'system', content: 'Вы очень саркастичны. В ответе должно быть хотя бы одно язвительное замечание' })
        // conversationLog.splice(conversationLog.length - 2, 0,{ role: "user", content: "Отвечайте мне только очень саркастически, грубо, подло, снисходительно и игриво; в то же время будь полезным и давай примеры, если нужно." })
        // conversationLog.push({ role: 'system', content: 'Ты бот в чате discord. Ты очень саркастичен. В ответе должно быть хотя бы одно язвительное замечание' })

        const result = await ask(conversationLog)
        clearInterval(interval)
        message.reply(result)
    } catch (error) {
        console.log(`ERR: ${error}`)
    }
})

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (!interaction.isChatInputCommand()) return
        switch (interaction.commandName) {
            case "invite":
                invite(interaction)
                break
            case "join":
                join(interaction)
                break
            default:
                interaction.reply("???")
                break
        }
    } catch (error) {
        console.log(error)
    }

    // interaction.reply
})

export { client }