const { User } = require('../model/User')
const ProfileUtils = require('../utils/ProfileUtils')

module.exports = {
    async get() {
        const filter = {email: "matheusroika@gmail.com"}

        const profile = await User.findOne(filter, 'name lastName avatar monthlySalary workDaysPerWeek workHoursPerDay vacationWeeksPerYear workHourValue')

        return profile
    },

    async update(newData) {
        for (item of Object.values(newData)) {
            if (!item) return 'Missing field'
        }

        if (!isNaN(newData.monthlySalary) || !isNaN(newData.workHoursPerDay) || !isNaN(newData.workDaysPerWeek) || !isNaN(newData.vacationWeeksPerYear)) return 'Invalid value'

        const filter = {email:"matheusroika@gmail.com"}
        
        await User.findOneAndUpdate(filter, newData)
    }
}