const Job = require('../model/Job')
const Profile = require('../model/Profile')

const JobUtils = require('../utils/JobUtils')

module.exports = {
    index(req, res) {
        return res.render("job", { message: req.flash() })
    },

    async create(req, res) {
        const job = req.body
        const jobs = await Job.get()
        job.createdAt = Date.now()

        job._id = jobs[jobs.length - 1]?._id + 1 || 1
    
        const isCreated = await Job.create(job)

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
        const jobs = await Job.get()
        const profile = await Profile.get()

        const _id = req.params.id
        const job = jobs.find(job => job._id == _id)

        if (!job) return res.send('Job not found!')

        job.budget = JobUtils.calculateBudget(job, profile.workHourValue)

        return res.render("job-edit", { job, message: req.flash() })
    },

    async update(req, res) {
        const _id = req.params.id

        const isUpdated = await Job.update(req.body, _id)

        if (isUpdated === 'Missing field') {
            req.flash('error', 'O formulário não foi totalmente preenchido.')
        } else if (isUpdated === 'Invalid value') {
            req.flash('error', 'Valor inserido é inválido.')
        }

        return res.redirect('/job/' + _id)
    },

    async delete(req, res) {
        const _id = req.params.id
        
        await Job.delete(_id)

        return res.redirect('/')
    }
}