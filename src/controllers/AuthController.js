const Auth = require('../model/Auth')

const argon2 = require('argon2')

module.exports = {
    index(req, res) {
        return res.render("auth", { message: req.flash() })
    },
    
    logout(req, res) {
        req.logout()
        req.session.destroy()
        res.redirect('/auth')
    },

    async register(req, res, next) {
        const user = req.body
        
        const isCreated = await Auth.createUser(user)

        if (isCreated === 'Missing field') {
            req.flash('error', 'O formulário não foi totalmente preenchido.')
            res.redirect('/auth')
        } else if (isCreated === 'User already exists'){
            req.flash('error', 'Esse email já está cadastrado.')
            res.redirect('/auth')
        } else if (isCreated === 'Invalid email'){
            req.flash('error', 'Esse email é inválido.')
            res.redirect('/auth')
        } else {
            req.flash('success', 'Sua conta foi criada. Por favor, confirme seu email.')
            return res.redirect('/auth')
        }
    },

    async validatePassword(userPassword, typedPassword) {
        return await argon2.verify(userPassword, typedPassword)
    },

    ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/auth')
    },

    forwardAuthenticated(req, res, next) {
        if(!req.isAuthenticated()) {
            return next()
        }
        res.redirect('/')
    }
}