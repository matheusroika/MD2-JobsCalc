const { User } = require('../model/User')


module.exports = {
    async get() {
        const filter = {email:"matheusroika@gmail.com"}

        const { jobs } = await User.findOne(filter, 'jobs')

        return jobs
    },

    async create(newData) {
        for (item of Object.values(newData)) {
            if (!item) return 'Missing field'
        }

        if (!isNaN(newData.dailyHoursOfWork) || !isNaN(newData.totalHoursOfWork)) return 'Invalid value'

        const filter = {email:"matheusroika@gmail.com"}

        const user = await User.findOne(filter)
        user.jobs.push(newData)
        await user.save()
    },

    async update(updatedData, _id) {
        for (item of Object.values(updatedData)) {
            if (!item) return 'Missing field'
        }

        if (!isNaN(updatedData.dailyHoursOfWork) || !isNaN(updatedData.totalHoursOfWork)) return 'Invalid value'

        const filter = {email:"matheusroika@gmail.com"}

        const user = await User.findOne(filter)
        user.jobs.map(job => {
            if(job._id == _id) {
                for (property in updatedData) {
                    job[property] = updatedData[property]
                }
            }
        })
        await user.save()
    },

    async delete(_id) {
        const filter = {email:"matheusroika@gmail.com"}

        const user = await User.findOne(filter)
        await user.jobs.pull(_id)
        await user.save()
    }
}