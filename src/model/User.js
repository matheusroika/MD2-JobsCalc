const mongoose = require('mongoose')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail')

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
    resetPasswordToken: String,
    changeEmailToken: String,
    isPlaceholder: Boolean,
    createdAt: { type: Date, default: Date.now },
    jobs: [
        {
            _id: Number,
            name: String,
            dailyHoursOfWork: Number,
            totalHoursOfWork: Number,
            status: String,
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
        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET)

        const confirmationLink = url + token

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

    async checkConfirmAccountToken(id) {
        const user = await User.findById(id)
        if (user) {
            if (user.active) {
                return 'User already confirmed'
            } else {
                user.active = true
                await user.save()
                return user
            }
        } else {
            return 'Invalid token'
        }
    },

    async sendForgotPasswordEmail(email, url) {
        if (!/^\S+@\S+$/.test(email)) return 'Invalid email'
        const user = await User.findOne({email})
        if (user) {
            if (!user.active) {
                return 'User is not confirmed'
            } else if (user.resetPasswordToken) {
                return 'User has reset pending'
            }
        } else {
            return 'Invalid email'
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET2)
        user.resetPasswordToken = await argon2.hash(token)

        const forgotLink = url + token

        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to: email,
            from: {
                email: process.env.SENDGRID_EMAIL,
                name: 'JobsCalc'
            },
            subject: 'Recupere sua senha',
            dynamic_template_data: {
                "name": user.name,
                "forgotLink": forgotLink,
            },
            template_id: process.env.SENDGRID_TEMPLATE_ID2
        }
        sgMail.send(msg)
            .then(async () => {
                console.log('Email sent')
                await user.save()
            })
            .catch((error) => {
                console.log(error)
                return 'Unknown error'
            }) 
    },

    async checkForgotPasswordToken(id, token) {
        const user = await User.findById(id)
        if (user) {
            if (!user.active) {
                return 'User is not confirmed'
            } else if(!user.resetPasswordToken) {
                return 'Invalid token'
            } else if(!await argon2.verify(user.resetPasswordToken, token)) {
                return 'Invalid token'
            } else {
                return user
            }
        } else {
            return 'Invalid token'
        }
    },

    async setNewPassword(password, userId, token) {
        if(!/.{6,}/.test(password)) return 'Invalid password'
        password = await argon2.hash(password)
        const user = await User.findById(userId)
        if (user) {
            if (!user.active) {
                return 'User is not confirmed'
            } else if(!user.resetPasswordToken) {
                return 'Invalid token'
            } else if(!await argon2.verify(user.resetPasswordToken, token)) {
                return 'Invalid token'
            } else {
                user.password = password
                user.resetPasswordToken = undefined
                await user.save()
                return user
            }
        } else {
            return 'Invalid token'
        }
        
    },

    async createPlaceholder() {
        function getRandomInt(min = 100000, max = 10000000) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        }

        const user = {
            email: getRandomInt(),
            password: getRandomInt(),
            active: true,
            name: "Nome",
            lastName: "Sobrenome",
            isPlaceholder: true,
        }

        const placeholderUser = new User(user)
        await placeholderUser.save()
        return placeholderUser
    },

    async deletePlaceholder(userId) {
        const user = await User.findById(userId)
        if (user) {
            if (user.isPlaceholder) {
                await User.findByIdAndDelete(userId)
            }
        }
    }
}