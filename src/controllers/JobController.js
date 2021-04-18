const Job = require('../model/Job')
const Profile = require('../model/Profile')

const JobUtils = require('../utils/JobUtils')

module.exports = {
    async index(req, res) {
        const userId = req.user.id
        const jobs = await Job.get(userId).then(jobs => jobs.toObject())
        const profile = await Profile.get(userId)

        const totalWorkHours = JobUtils.calculateTotalWorkHours(jobs)
        const freeHours = profile.workHoursPerDay - totalWorkHours
        return res.render("job", { message: req.flash(), freeHours })
    },

    async create(req, res) {
        const userId = req.user.id
        const job = req.body
        
        const jobs = await Job.get(userId)
        job.createdAt = Date.now()
        job._id = jobs[jobs.length - 1]?._id + 1 || 1
    
        const isCreated = await Job.create(job, userId)

        if (isCreated === 'Missing field') {
            req.flash('error', 'O formulário não foi totalmente preenchido.')
            return res.redirect("/job")
        } else if (isCreated === 'Invalid value') {
            req.flash('error', 'Valor inserido é inválido.')
            return res.redirect("/job")
        }

        return res.redirect("/")
    },

    async edit(req, res) {
        const userId = req.user.id
        const jobId = req.params.id

        const jobs = await Job.get(userId)
        const profile = await Profile.get(userId)

        const job = jobs.find(job => job._id == jobId)
        if (!job) return res.send('Job not found!')
        job.budget = JobUtils.calculateBudget(job, profile.workHourValue)

        const jobWorkHours = job.dailyHoursOfWork
        const totalWorkHours = JobUtils.calculateTotalWorkHours(jobs)
        const freeHours = profile.workHoursPerDay - totalWorkHours

        return res.render("job-edit", { job, message: req.flash(), freeHours, jobWorkHours })
    },

    async update(req, res) {
        const userId = req.user.id
        const jobId = req.params.id

        const isUpdated = await Job.update(req.body, userId, jobId)

        if (isUpdated === 'Missing field') {
            req.flash('error', 'O formulário não foi totalmente preenchido.')
        } else if (isUpdated === 'Invalid value') {
            req.flash('error', 'Valor inserido é inválido.')
        }

        return res.redirect('/job/' + jobId)
    },

    async delete(req, res) {
        const userId = req.user.id
        const jobId = req.params.id
        
        await Job.delete(userId, jobId)

        return res.redirect('/')
    }
}