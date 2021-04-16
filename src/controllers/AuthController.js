const User = require('../model/User')

const argon2 = require('argon2')

module.exports = {
    index(req, res) {
        return res.render("auth", { message: req.flash() })
    },
    
    logout(req, res) {
        req.logout()
        req.session.destroy()
        return res.redirect('/auth')
    },

    async register(req, res, next) {
        const user = req.body
        
        const isCreated = await User.create(user)

        if (isCreated === 'Missing field') {
            req.flash('error', 'O formulário não foi totalmente preenchido.')
        } else if (isCreated === 'Invalid password'){
            req.flash('error', 'Sua senha deve ter 6 ou mais caracteres.')
        } else if (isCreated === 'Invalid email'){
            req.flash('error', 'Esse email é inválido.')
        }else if (isCreated === 'User already exists'){
            req.flash('error', 'Esse email já está cadastrado.')
        } else {
            req.flash('success', 'Sua conta foi criada. Por favor, confirme seu email.')
        }

        return res.redirect('/auth')
    },

    async validatePassword(userPassword, typedPassword) {
        return await argon2.verify(userPassword, typedPassword)
    },

    ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        return res.redirect('/auth')
    },

    forwardAuthenticated(req, res, next) {
        if(!req.isAuthenticated()) {
            return next()
        }
        return res.redirect('/')
    }
}