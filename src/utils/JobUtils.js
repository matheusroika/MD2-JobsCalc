module.exports = {
    calculateRemainingDays(job) {
        const totalDays = Math.round((job.totalHours / job.dailyHours))
    
        const createdDate = new Date(job.createdAt)
        const dueDay = createdDate.getDate() + totalDays
        const dueDateInMs = createdDate.setDate(dueDay)
    
        const remainingDaysInMs = dueDateInMs - Date.now()
        
        const dayInMs = 24 * 60 * 60 * 1000
        const remainingDays = Math.round(remainingDaysInMs / dayInMs)
    
        return remainingDays
    },
    calculateBudget: (job, hourValue) => job.totalHours * hourValue
}