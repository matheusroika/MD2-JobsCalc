const Database = require('../db/config')

const ProfileUtils = require('../utils/ProfileUtils')

module.exports = {
    async get() {
        const db = await Database()

        const data = await db.get(`SELECT * FROM profiles`)

        await db.close()

        if (data.hourValue === null) {
            data.hourValue = ProfileUtils.calculateHourlyBudget(data)
        }

        return data
    },

    async update(newData) {
        const db = await Database()

        db.run(
            `UPDATE profiles SET
            name = "${newData.name}",
            avatar = "${newData.avatar}",
            monthlyBudget = ${newData.monthlyBudget},
            daysPerWeek = ${newData.daysPerWeek},
            hoursPerDay = ${newData.hoursPerDay},
            vacationPerYear = ${newData.vacationPerYear},
            hourValue = ${newData.hourValue}`
        )

        await db.close()
    }
}