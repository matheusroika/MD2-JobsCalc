const jwt = require('jsonwebtoken')

const User = require('../model/User')

module.exports = {
    async sendToken(req, res) {
        const url = req.protocol + '://' + req.get('Host') + req.originalUrl + '/'
        userEmail = req.body.email

        const status = await User.sendForgotPasswordEmail(userEmail, url)
        if (status === 'User is not confirmed') {
            req.flash('error', 'Sua conta não foi confirmada. Por favor, cheque seu email.')
        } else if (status === 'User has reset pending') {
            req.flash('error', 'Sua conta já tem um processo de recuperação de senha ativo. Por favor, cheque seu email.')
        } else if (status === 'Invalid email') {
            req.flash('error', 'Email inválido.')
        } else if (status === 'Unknown error') {
            req.flash('error', 'Erro inesperado.')
        } else {
            req.flash('success', 'Por favor, cheque seu email para criar uma nova senha.')
        }
        return res.redirect('/auth')
    },

    async validateToken(req, res) {
        const token = req.params.token
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET2, (err, decodedToken) => {
            if (err) return 
            return decodedToken
        })

        if (!decodedToken) {
            req.flash('error', 'Esse link é inválido.')
            return res.redirect('/auth')
        }

        const tokenLife = 24 * 60 * 60 * 1000
        const tokenTime = decodedToken.iat * 1000
        const dateNow = Date.now()

        if (tokenTime + tokenLife < dateNow) {
            req.flash('error', 'Esse link de recuperação expirou. Por favor, tente novamente.')
            return res.redirect('/auth')
        }

        await User.checkForgotPasswordToken(decodedToken.id, token)
            .then(user => {
                if (user === 'User is not confirmed') {
                    req.flash('error', 'Sua conta não foi confirmada. Por favor, cheque seu email.')
                    return res.redirect('/auth')
                } else if (user === 'Invalid token') {
                    req.flash('error', 'Esse link de recuperação expirou. Por favor, tente novamente.')
                    return res.redirect('/auth')
                } else {
                    return res.render('forgot-password', { message: req.flash(), id: user._id })
                }
            })
    },

    async createPassword(req, res) {
        const newPassword = req.body.password
        const userId = req.body.userId
        const token = req.params.token

        await User.setNewPassword(newPassword, userId, token)
            .then(user => {
                if (user === 'User is not confirmed') {
                    req.flash('error', 'Sua conta não foi confirmada. Por favor, cheque seu email.')
                    return res.redirect('/auth')
                } else if (user === 'Invalid token') {
                    req.flash('error', 'Esse link de recuperação expirou. Por favor, tente novamente.')
                    return res.redirect('/auth')
                } else {
                    req.login(user, err => {
                        if (err) return next(err)
    
                        req.flash('success', 'Sua senha foi alterada com sucesso!')
                        return res.redirect('/profile')
                    })
                }
            })
    },
}