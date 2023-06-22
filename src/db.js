import pkg from 'sqlite3'
const { Database } = pkg



function prepair() {
    const db = new Database('./discord.db')
    db.serialize(() => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='chanels'", (e, r) => {
            if (!r)
                db.run("CREATE TABLE chanels (id TEXT)")
        })
    })

    db.close()
}

function addChanel(id) {
    const db = new Database('./discord.db')
    db.serialize(() => {
        db.run(`INSERT INTO chanels (id) VALUES('${id}')`)
    })

    db.close()
}

function getChanel(id) {
    const db = new Database('./discord.db')
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(`SELECT id FROM chanels WHERE id='${id}'`, (e, r) => {
                if (e)
                    reject()
                else
                    resolve(r)
            })
        })

        db.close()
    })
}

export { prepair, addChanel, getChanel }