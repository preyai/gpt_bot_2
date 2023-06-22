import fluentFfmpeg from "fluent-ffmpeg"


function convertPcmToOgg(pcmFilePath, oggFilePath) {
    return new Promise((resolve, reject) => {
        fluentFfmpeg()
            .input(pcmFilePath)
            .inputFormat('s32le')
            .output(oggFilePath)
            .audioCodec('libvorbis')
            .outputOptions(['-vn', '-ar 48000', '-ac 2', '-b:a 192k'])
            .on('end', () => {
                resolve()
            })
            .on('error', (err) => {
                console.error('An error occurred:', err.message)
                return reject(new Error(err))
            })
            .run()
    })
}

export default convertPcmToOgg
