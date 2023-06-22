import opus from "@discordjs/opus"
import { AudioPlayer, AudioPlayerStatus, EndBehaviorType, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice"
import { createReadStream, readFileSync, unlink, writeFileSync } from "fs"
import { join } from "path"
import { stt, tts } from "../yandex.js"
import { ask } from "../gpt.js"
import convertPcmToOgg from "../libs/pcmToOgg.js"



function getOutputPath(buffers) {
    const concatenatedBuffer = Buffer.concat(buffers)
    const outputPath = `./opus/input${new Date().getTime()}.pcm`
    writeFileSync(outputPath, concatenatedBuffer)
    return outputPath
}

function invite(interaction) {
    // const streams: stream[] = []
    interaction.guild?.members.fetch(interaction.user)
        .then(user => {
            if (user.voice && user.voice.channelId && interaction.guild && interaction.guildId) {
                const connection = joinVoiceChannel({
                    channelId: user.voice.channelId,
                    guildId: interaction.guildId,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: false,
                    debug: true,
                })
                const player = createAudioPlayer()
                connection.subscribe(player)

                const queue = []

                player.on(AudioPlayerStatus.Idle, () => {

                    if (queue.length > 0) {
                        player.play(queue.shift())
                    }
                })

                connection.receiver.speaking.on("start", (user) => {
                    const buffers = []

                    const encoder = new opus.OpusEncoder(48000, 2)
                    const audio = connection.receiver.subscribe(user, {
                        end: {
                            behavior: EndBehaviorType.AfterSilence,
                            duration: 100
                        }
                    })

                    audio.on("data", (chunk) => {
                        // console.log(buffers.length)
                        buffers.push(encoder.decode(chunk))
                    })
                    audio.once('end', async () => {
                        if (buffers.length < 50) {
                            return
                        }

                        const outputPath = getOutputPath(buffers)

                        await convertPcmToOgg(outputPath, `${outputPath}.ogg`)

                        unlink(outputPath, () => { })

                        const text = await stt(`${outputPath}.ogg`)

                        unlink(`${outputPath}.ogg`, () => { })

                        if (text && text.result && text.result.match("Бот")) {
                            const answer = await ask([{ role: "user", content: text.result }])
                            const yares = await tts(answer.content)

                            const resource = createAudioResource(yares)

                            setTimeout(() => {
                                unlink(yares, () => { })
                            }, 100000)

                            if (player.state.status === "idle")
                                player.play(resource)
                            else
                                queue.push(resource)
                        }
                    })
                })
            }
            interaction.reply("ok")
        })
}

export default invite