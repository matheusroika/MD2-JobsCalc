const { User } = require('../model/User')

const JobUtils = require('../utils/JobUtils')

module.exports = {
    async get(userId) {
        const filter = {_id: userId}
        const { jobs } = await User.findOne(filter, 'jobs')
        return jobs
    },

    async create(newData, userId) {
        for (item of Object.values(newData)) {
            if (!item) return 'Missing field'
        }

        if (isNaN(newData.dailyHoursOfWork) || isNaN(newData.totalHoursOfWork) || newData.dailyHoursOfWork > 24 || newData.dailyHoursOfWork < 1 || newData.totalHoursOfWork < 1) return 'Invalid value'

        const user = await User.findById(userId)
        if (user) {
            if (!user.monthlySalary || !user.workDaysPerWeek || !user.workHoursPerDay || !user.vacationWeeksPerYear || !user.workHourValue) return 'Incomplete profile'
        } else {
            return 'User not found'
        }

        const remainingDays = JobUtils.calculateRemainingDays(newData)
        const status = remainingDays <= 0 ? 'done' : 'progress'
        newData.status = status

        user.jobs.push(newData)
        await user.save()
    },

    async update(updatedData, userId, jobId) {
        for (item of Object.values(updatedData)) {
            if (!item) return 'Missing field'
        }

        if (isNaN(updatedData.dailyHoursOfWork) || isNaN(updatedData.totalHoursOfWork) || updatedData.dailyHoursOfWork > 24 || updatedData.dailyHoursOfWork < 1 || updatedData.totalHoursOfWork < 1) return 'Invalid value'

        const user = await User.findById(userId)
        user.jobs.map(job => {
            if(job._id == jobId) {
                for (property in updatedData) {
                    job[property] = updatedData[property]
                }
                const remainingDays = JobUtils.calculateRemainingDays(job)
                const status = remainingDays <= 0 ? 'done' : 'progress'
                job.status = status
            }
        })
        await user.save()
    },

    async delete(userId, jobId) {
        const user = await User.findById(userId)
        await user.jobs.pull(jobId)
        await user.save()
    },

    async end(userId, jobId) {
        const user = await User.findById(userId)

        user.jobs.map(job => {
            if(job._id == jobId) {
                if (job.status === 'done') {
                    job.createdAt = new Date
                    job.status = 'progress'
                } else {
                    job.status = 'done'
                }
            }
        })
        await user.save()
    }
}