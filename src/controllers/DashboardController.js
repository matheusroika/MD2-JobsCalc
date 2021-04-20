const Job = require('../model/Job')
const Profile = require('../model/Profile')

const JobUtils = require('../utils/JobUtils')

module.exports = {
    async index(req, res) {
        const userId = req.user.id

        const jobs = await Job.get(userId).then(jobs => jobs.toObject())
        const profile = await Profile.get(userId)

        const jobsCount = {
            progress: 0,
            done: 0,
            total: jobs.length
        }

        let jobTotalHours = 0

        const updatedJobs = jobs.map(job => {
            const remainingDays = JobUtils.calculateRemainingDays(job)
            const budget = JobUtils.calculateBudget(job, profile.workHourValue)

            if (remainingDays <= 0) {
                Job.updateStatus(job._id, userId)
                job.status = 'done'
            }

            jobsCount[job.status] += 1
            if (job.status == 'progress') jobTotalHours += job.dailyHoursOfWork

            return {
                ...job,
                remainingDays,
                budget
            }
        })

        const freeHours = profile.workHoursPerDay - jobTotalHours
        
        return res.render("index", { jobs: updatedJobs, profile, jobsCount, freeHours })
    }
}