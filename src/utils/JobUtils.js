module.exports = {
    calculateRemainingDays(job) {
        const totalDays = Math.round((job.totalHoursOfWork / job.dailyHoursOfWork))
    
        const dueDay = job.createdAt.getDate() + totalDays
        const dueDateInMs = job.createdAt.setDate(dueDay)
    
        const remainingDaysInMs = dueDateInMs - Date.now()
        
        const dayInMs = 24 * 60 * 60 * 1000
        const remainingDays = Math.round(remainingDaysInMs / dayInMs)
    
        return remainingDays
    },
    calculateBudget: (job, hourValue) => job.totalHoursOfWork * hourValue
}