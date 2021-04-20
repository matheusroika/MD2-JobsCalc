const jwt = require('jsonwebtoken')

const Profile = require('../model/Profile')

const ProfileUtils = require('../utils/ProfileUtils')

module.exports = {
    async index(req, res) {
        const userId = req.user.id

        return res.render("profile", { profile: await Profile.get(userId), message: req.flash() })
    },

    async update(req, res) {
        const profile = req.body
        const userId = req.user.id

        const status = await Profile.update(profile, userId)

        if (status === 'Missing field') {
            req.flash('error', 'O formulário não foi totalmente preenchido.')
        }

        return res.redirect('/profile')
    },

    async calculate(req, res) {
        const profile = req.body
        const userId = req.user.id

        const hourlySalary = ProfileUtils.calculateHourlySalary(profile)
        profile.workHourValue = hourlySalary

        const status = await Profile.calculate(profile, userId)

        if (status === 'Missing field') {
            req.flash('error', 'O formulário não foi totalmente preenchido.')
        } else if (status === 'Invalid value') {
            req.flash('error', 'Valor inserido é inválido.')
        }

        return res.redirect('/profile')
    },

    async delete(req, res) {
        const password = req.body.password
        const userId = req.user.id

        const status = await Profile.delete(password, userId)

        if (status === 'Missing field') {
            req.flash('error', 'O formulário não foi totalmente preenchido.')
            return res.redirect('/profile')
        } else if (status === 'Placeholder account') {
            req.flash('error', 'Essa conta é temporária. Ela será apagada automaticamente.')
            return res.redirect('/profile')
        } else if (status === 'Wrong password') {
            req.flash('error', 'Senha errada.')
            return res.redirect('/profile')
        } else {
            req.flash('success', 'Sua conta foi apagada com sucesso.')
        }

        return res.redirect('/auth')
    },

    async changeEmailPage(req, res) {
        const userId = req.user.id
        await module.exports.check(res, userId)

        return res.render("change-email", { message: req.flash() })
    },

    async changeEmail(req, res) {
        const userId = req.user.id
        await module.exports.check(res, userId)
        
        const url = req.protocol + '://' + req.get('Host') + req.originalUrl + '/'
        const newEmail = req.body.email

        const status = await Profile.sendEmail(newEmail, url, userId)
        if (status === 'Invalid email') {
            req.flash('error', 'Esse email é inválido.')
            return res.redirect('/profile/change-email')
        } else if (status === 'User already exists') {
            req.flash('error', 'Esse email já está cadastrado.')
            return res.redirect('/profile/change-email')
        } else if (status === 'User is not confirmed') {
            req.flash('error', 'Sua conta não foi confirmada. Por favor, cheque seu email.')
            return res.redirect('/profile/change-email')
        } else if (status === 'User has email change pending') {
            req.flash('error', 'Sua conta já tem um processo de mudança de email ativo. Por favor, cheque seu email.')
            return res.redirect('/profile/change-email')
        } else if (status === 'Unknown error') {
            req.flash('error', 'Erro inesperado.')
            return res.redirect('/profile/change-email')
        } else {
            req.flash('success', 'Enviamos um link de confirmação para seu novo email. Por favor, confirme a alteração.')
        }

        return res.redirect('/profile')
    },

    async changePasswordPage(req, res) {
        const userId = req.user.id
        await module.exports.check(res, userId)

        return res.render("change-password", { message: req.flash() })
    },

    async changePassword(req, res) {
        const userId = req.user.id
        await module.exports.check(res, userId)

        const currentPassword = req.body.currentPassword
        const newPassword = req.body.password

        const status = await Profile.changePassword(currentPassword, newPassword, userId)
        if (status === 'Invalid password') {
            req.flash('error', 'Sua senha deve ter 6 ou mais caracteres.')
            return res.redirect('/profile/change-password')
        } else if (status === 'Wrong password') {
            req.flash('error', 'Sua senha atual está errada.')
            return res.redirect('/profile/change-password')
        } else {
            req.flash('success', 'Sua senha foi alterada com sucesso.')
        }

        return res.redirect('/profile')
    },

    async validateToken(req, res) {
        const token = req.params.token
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET3, (err, decodedToken) => {
            if (err) return 
            return decodedToken
        })

        if (!decodedToken) {
            req.flash('error', 'Esse link é inválido.')
            return res.redirect('/profile')
        }

        const tokenLife = 60 * 60 * 1000
        const tokenTime = decodedToken.iat * 1000
        const dateNow = Date.now()

        if (tokenTime + tokenLife < dateNow) {
            await Profile.deleteChangeEmailToken(decodedToken.id)
            req.flash('error', 'Esse link de mudança expirou. Por favor, tente novamente.')
            return res.redirect('/profile')
        }
        
        await Profile.checkChangeEmailToken(decodedToken.id, token, decodedToken.email)
            .then(user => {
                if (user === 'User is not confirmed') {
                    req.flash('error', 'Sua conta não foi confirmada. Por favor, cheque seu email.')
                } else if (user === 'Invalid token') {
                    req.flash('error', 'Esse link de mudança expirou. Por favor, tente novamente.')
                } else {
                    req.flash('success', 'Seu email foi alterado com sucesso.')
                }
            })

        return res.redirect('/profile')
    },

    async check(res, userId) {
        const status = await Profile.check(userId)
        if (status === 'User not found') {
            req.flash('error', 'Usuário não encontrado')
            return res.redirect("/profile")
        } else if (status === 'Placeholder account') {
            req.flash('error', 'Essa conta é temporária. Não é possível alterar seu email ou senha.')
            return res.redirect("/profile")
        } else if (status === 'User is not confirmed') {
            req.flash('error', 'Sua conta não foi confirmada. Por favor, cheque seu email.')
            return res.redirect("/profile")
        }
    }
}