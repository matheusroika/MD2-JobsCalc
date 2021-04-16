const Profile = require('../model/Profile')

const ProfileUtils = require('../utils/ProfileUtils')

module.exports = {
    async index(req, res) {
        return res.render("profile", { profile: await Profile.get(), message: req.flash() })
    },

    async update(req, res) {
        const profile = req.body

        const hourlySalary = ProfileUtils.calculateHourlySalary(profile)
        profile.workHourValue = hourlySalary

        const isUpdated = await Profile.update(profile)

        if (isUpdated === 'Missing field') {
            req.flash('error', 'O formulário não foi totalmente preenchido.')
        } else if (isUpdated === 'Invalid value') {
            req.flash('error', 'Valor inserido é inválido.')
        }

        return res.redirect('/profile')
    }
}