module.exports = {
    calculateRemainingDays(job) {
        const totalDays = Math.ceil((job.totalHoursOfWork / job.dailyHoursOfWork))

        const dueDay = job.createdAt ? job.createdAt.getDate() + totalDays : new Date.getDate() + totalDays
        const dueDateInMs = job.createdAt ? job.createdAt.setDate(dueDay) : new Date.setDate(dueDay)
    
        const remainingDaysInMs = dueDateInMs - Date.now()
        const dayInMs = 24 * 60 * 60 * 1000

        const remainingDays = Math.round(remainingDaysInMs / dayInMs)
        return remainingDays
    },

    calculateBudget: (job, hourValue) => job.totalHoursOfWork * hourValue,

    calculateTotalWorkHours(jobs) {
        let jobTotalHours = 0

        jobs.map(job => {
            const remainingDays = module.exports.calculateRemainingDays(job)
            const status = remainingDays <= 0 ? 'done' : 'progress'
            
            if (status == 'progress') jobTotalHours += job.dailyHoursOfWork
        })

        return jobTotalHours
    }
}