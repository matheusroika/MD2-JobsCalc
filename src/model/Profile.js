const { database } = require('../db/config')

const ProfileUtils = require('../utils/ProfileUtils')

module.exports = {
    async get() {
        const db = await database()
        const filter = {"email":"matheusroika@gmail.com"}
        //projection is used to control which fields are returned by the find function
        //0 = don't return, 1 = return
        const projection = {projection: {_id: 0, profile: 1}}

        const { profile } = await db.collection('users').findOne(filter, projection)

        if (profile.hourValue === null) {
            profile.hourValue = ProfileUtils.calculateHourlyBudget(profile)
        }

        return profile
    },

    async update(newData) {
        const db = await database()
        const filter = {"email":"matheusroika@gmail.com"}

        newData = {
            ...newData,
            monthlySalary: Number(newData.monthlySalary),
            workHoursPerDay: Number(newData.workHoursPerDay),
            workDaysPerWeek: Number(newData.workDaysPerWeek),
            vacationWeeksPerYear: Number(newData.vacationWeeksPerYear),
            workHourValue: Number(newData.workHourValue),
        }
        
        await db.collection('users').updateOne(
            filter, 
            {$set: {
                "profile": newData}})
    }
}