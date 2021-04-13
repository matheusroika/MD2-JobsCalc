const Job = require('../model/Job')
const Profile = require('../model/Profile')

const JobUtils = require('../utils/JobUtils')

module.exports = {
    async index(req, res) {
        const jobs = await Job.get()
        const profile = await Profile.get()

        const jobsCount = {
            progress: 0,
            done: 0,
            total: jobs.length
        }

        let jobTotalHours = 0

        const updatedJobs = jobs.map(job => {
            const remainingDays = JobUtils.calculateRemainingDays(job)
            const status = remainingDays <= 0 ? 'done' : 'progress'
            const budget = JobUtils.calculateBudget(job, profile.hourValue)

            jobsCount[status] += 1
            
            if (status == 'progress') jobTotalHours += Number(job.dailyHours)

            return {
                ...job,
                remainingDays,
                status,
                budget
            }
        })

        const freeHours = profile.hoursPerDay - jobTotalHours
        
        return res.render("index", { jobs: updatedJobs, profile, jobsCount, freeHours })
    }
}