import { addChanel } from "../db.js"


function join(interaction) {
    addChanel(interaction.options.get("chanel").value)
    interaction.reply("Теперь я буду видеть сообщения на этом канале")
}

export default join