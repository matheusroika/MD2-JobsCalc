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

    async create(user, url) {
        for (item of Object.values(user)) {
            if (!item) return 'Missing field'
        }

        if(!/.{6,}/.test(user.password)) return 'Invalid password'

        if (!/^\S+@\S+$/.test(user.email)) return 'Invalid email'

        const userCheck = await User.findOne({email: user.email})
        if (userCheck) return 'User already exists'

        user.password = await argon2.hash(user.password)
        
        const newUser = new User(user)

        //email confirmation
        const jwt = require('jsonwebtoken')
        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET)

        const confirmationLink = url + token

        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to: newUser.email,
            from: {
                email: process.env.SENDGRID_EMAIL,
                name: 'JobsCalc'
            },
            subject: 'Confirme sua conta',
            dynamic_template_data: {
                "name": newUser.name,
                "confirmationLink": confirmationLink,
            },
            template_id: process.env.SENDGRID_TEMPLATE_ID
        }
        sgMail.send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error)
            })

        await newUser.save()

        return newUser
    },

    async confirmEmail(id) {
        const user = await User.findById(id)
        if (user) {
            if (user.active) {
                return 'User already confirmed'
            } else {
                user.active = true
                return user
            }
        } else {
            return 'Invalid token'
        }
    }
}