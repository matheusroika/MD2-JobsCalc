const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail')

const { User } = require('../model/User')

module.exports = {
    async get(userId) {
        const filter = {_id: userId}

        const profile = await User.findOne(filter, 'name lastName avatar monthlySalary workDaysPerWeek workHoursPerDay vacationWeeksPerYear workHourValue isPlaceholder')

        return profile
    },

    async update(newData, userId) {
        if(!newData.name || !newData.lastName) return 'Missing field'

        const filter = {_id: userId}
        
        await User.findOneAndUpdate(filter, newData)
    },

    async calculate(newData, userId) {
        if(!newData.monthlySalary || !newData.workHoursPerDay || !newData.workDaysPerWeek || !newData.vacationWeeksPerYear) return 'Missing field'

        if (isNaN(newData.monthlySalary) || isNaN(newData.workHoursPerDay) || isNaN(newData.workDaysPerWeek) || isNaN(newData.vacationWeeksPerYear) || newData.workHoursPerDay < 1 || newData.workHoursPerDay > 24 || newData.workDaysPerWeek < 1 || newData.workDaysPerWeek > 7 || newData.vacationWeeksPerYear < 0 || newData.vacationWeeksPerYear > 51) return 'Invalid value'

        const filter = {_id: userId}
        
        await User.findOneAndUpdate(filter, newData)
    },

    async delete(password, userId) {
        if (!password) return 'Missing field'
        
        const user = await User.findById(userId)

        if (user.isPlaceholder) {
            return 'Placeholder account'
        }

        if (await argon2.verify(user.password, password)) {
            await User.findByIdAndDelete(userId)
        } else {
            return 'Wrong password'
        }
    },

    async check(userId) {
        await User.findById(userId)
            .then(user => {
                if (!user) {
                    return 'User not found'
                } else if (user.isPlaceholder) {
                    return 'Placeholder account'
                } else if (!user.active) {
                    return 'User is not confirmed'
                }
            })
    },

    async changePassword(currentPassword, newPassword, userId) {
        if(!/.{6,}/.test(newPassword)) return 'Invalid password'
        const user = await User.findById(userId)
        const isMatch = await argon2.verify(String(user.password), String(currentPassword))
        if (isMatch) {
            const password = await argon2.hash(newPassword)
            user.password = password
            await user.save()
        } else {
            return 'Wrong password'
        }
    },

    async sendEmail(email, url, userId) {
        if (!/^\S+@\S+$/.test(email)) return 'Invalid email'

        const userCheck = await User.findOne({email})
        if (userCheck) return 'User already exists'

        const user = await User.findById(userId)
        if (!user.active) {
            return 'User is not confirmed'
        } else if (user.changeEmailToken) {
            return 'User has email change pending'
        }

        const token = jwt.sign({id: user._id, email}, process.env.JWT_SECRET3)
        user.changeEmailToken = await argon2.hash(token)

        const confirmationLink = url + token

        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to: email,
            from: {
                email: process.env.SENDGRID_EMAIL,
                name: 'JobsCalc'
            },
            subject: 'Confirme seu novo email',
            dynamic_template_data: {
                "name": user.name,
                "confirmationLink": confirmationLink,
            },
            template_id: process.env.SENDGRID_TEMPLATE_ID3
        }
        sgMail.send(msg)
            .then(async () => {
                console.log('Email sent')
                await user.save()
            })
            .catch((error) => {
                console.error(error)
                return 'Unknown error'
            })
    },

    async checkChangeEmailToken(id, token, newEmail) {
        const user = await User.findById(id)
        if (user) {
            if (!user.active) {
                return 'User is not confirmed'
            } else if(!user.changeEmailToken) {
                return 'Invalid token'
            } else if(!await argon2.verify(user.changeEmailToken, token)) {
                return 'Invalid token'
            } else {
                user.email = newEmail
                user.changeEmailToken = undefined
                await user.save()
            }
        } else {
            return 'Invalid token'
        }
    },

    async deleteChangeEmailToken(userId) {
        const user = await User.findById(userId)
        user.changeEmailToken = undefined
        await user.save()
    }
}