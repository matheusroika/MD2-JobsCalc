const Profile = require('../model/Profile')

const ProfileUtils = require('../utils/ProfileUtils')

module.exports = {
    async index(req, res) {
        return res.render("profile", { profile: await Profile.get() })
    },

    async update(req, res) {
        const profile = req.body

        const hourlySalary = ProfileUtils.calculateHourlySalary(profile)
        profile.workHourValue = hourlySalary

        await Profile.update(profile)

        return res.redirect('/profile')
    }
}