const Database = require('../db/config')


module.exports = {
    async get() {
        const db = await Database()
        const data = await db.all(`SELECT * FROM jobs`)
        await db.close()
        return data
    },

    async create(newData) {
        const db = await Database()
        await db.run(
            `INSERT INTO jobs (
                name,
                dailyHours,
                totalHours,
                createdAt
            ) VALUES (
                "${newData.name}",
                ${newData.dailyHours},
                ${newData.totalHours},
                ${newData.createdAt}
            );`
        )
        await db.close()
    },

    async update(updatedData, id) {
        const db = await Database()

        await db.run(
            `UPDATE jobs SET
            name = "${updatedData.name}",
            dailyHours = ${updatedData.dailyHours},
            totalHours = ${updatedData.totalHours}
            WHERE id = ${id}`
        )

        await db.close()
    },

    async delete(id) {
        const db = await Database()

        await db.run(`DELETE FROM jobs WHERE id = ${id}`)

        await db.close()
    }
}