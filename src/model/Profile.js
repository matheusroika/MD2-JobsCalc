const { User } = require('../model/User')

module.exports = {
    async get(userId) {
        const filter = {_id: userId}

        const profile = await User.findOne(filter, 'name lastName avatar monthlySalary workDaysPerWeek workHoursPerDay vacationWeeksPerYear workHourValue')

        return profile
    },

    async update(newData, userId) {
        if(!newData.name || !newData.monthlySalary || !newData.workHoursPerDay || !newData.workDaysPerWeek || !newData.vacationWeeksPerYear) return 'Missing field'

        if (isNaN(newData.monthlySalary) || isNaN(newData.workHoursPerDay) || isNaN(newData.workDaysPerWeek) || isNaN(newData.vacationWeeksPerYear)) return 'Invalid value'

        const filter = {_id: userId}
        
        await User.findOneAndUpdate(filter, newData)
    }
}