const Job = require('../model/Job')
const Profile = require('../model/Profile')

const JobUtils = require('../utils/JobUtils')

module.exports = {
    index(req, res) {
        return res.render("job")
    },

    async create(req, res) {
        const job = req.body
        const jobs = await Job.get()
        job.createdAt = Date.now()

        job.id = jobs[jobs.length - 1]?.id + 1 || 1
    
        await Job.create(job)
        return res.redirect("/")
    },

    async edit(req, res) {
        const jobs = await Job.get()
        const profile = await Profile.get()

        const id = req.params.id
        const job = jobs.find(job => job.id == id)

        if (!job) return res.send('Job not found!')

        job.budget = JobUtils.calculateBudget(job, profile.workHourValue)

        return res.render("job-edit", { job })
    },

    async update(req, res) {
        const id = req.params.id
        
        const updatedJob = {
            name: req.body.name,
            "dailyHoursOfWork": req.body.dailyHoursOfWork,
            "totalHoursOfWork": req.body.totalHoursOfWork,  
        }

        await Job.update(updatedJob, id)

        res.redirect('/job/' + id)
    },

    async delete(req, res) {
        const id = req.params.id
        
        await Job.delete(id)

        return res.redirect('/')
    }
}