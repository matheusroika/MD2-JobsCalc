const User = require('../model/User')

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

        const url = req.protocol + '://' + req.get('Host') + req.originalUrl + '/'
        
        const isCreated = await User.create(user, url)

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
        const argon2 = require('argon2')
        return await argon2.verify(userPassword, typedPassword)
    },

    async token(req, res) {
        const token = req.params.token
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return 
            return decoded
        })

        if (!decoded) {
            req.flash('error', 'Esse link é inválido.')
            return res.redirect('/auth')
        }

        const tokenLife = 24 * 60 * 60 * 1000
        const tokenTime = decoded.iat * 1000
        const dateNow = Date.now()

        if (tokenTime + tokenLife < dateNow) {
            req.flash('error', 'Esse link de confirmação expirou. Por favor, registre-se novamente.')
            return res.redirect('/auth')
        }

        await User.confirmEmail(decoded.id)
            .then(user => {
                if (user === 'User already confirmed') {
                    req.flash('error', 'Sua conta já está confirmada. Por favor, faça login.')
                    return res.redirect('/auth')
                } else if (user === 'Invalid token') {
                    req.flash('error', 'Esse link de confirmação expirou. Por favor, registre-se novamente.')
                    return res.redirect('/auth')
                } else {
                    req.login(user, err => {
                        if (err) return next(err)
        
                        req.flash('success', 'Sua conta foi confirmada com sucesso!')
                        return res.redirect('/profile')
                    })
                }
            })
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