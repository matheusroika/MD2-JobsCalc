const mongoose = require('mongoose')
const argon2 = require('argon2')

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    active: { type: Boolean, default: false },
    name: String,
    lastName: String,
    avatar: String,
    monthlySalary: Number,
    workDaysPerWeek: Number,
    workHoursPerDay: Number,
    vacationWeeksPerYear: Number,
    workHourValue: Number,
    jobs: [
        {
            _id: Number,
            name: String,
            dailyHoursOfWork: Number,
            totalHoursOfWork: Number,
            createdAt: { type: Date, default: Date.now }
        }
    ]
})

const User = mongoose.model('User', userSchema)

module.exports = {
    User,

    async create(user) {
        for (item of Object.values(user)) {
            if (!item) return 'Missing field'
        }

        if(!/.{6,}/.test(user.password)) return 'Invalid password'

        if (!/^\S+@\S+$/.test(user.email)) return 'Invalid email'

        const userCheck = await User.findOne({email: user.email})
        if (userCheck) return 'User already exists'

        user.password = await argon2.hash(user.password)
        
        const newUser = new User(user)

        await newUser.save()

        return true
    }
}