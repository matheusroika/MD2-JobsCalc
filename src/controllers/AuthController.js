const jwt = require('jsonwebtoken')
const argon2 = require('argon2')

const User = require('../model/User')

module.exports = {
    index(req, res) {
        return res.render("auth", { message: req.flash() })
    },
    
    async logout(req, res) {
        const userId = req.user.id
        await User.deletePlaceholder(userId)
        req.logout()
        req.session.destroy()
        return res.redirect('/auth')
    },

    async register(req, res) {
        const user = req.body

        const url = req.protocol + '://' + req.get('Host') + req.originalUrl + '/'
        
        const status = await User.create(user, url)
        if (status === 'Missing field') {
            req.flash('error', 'O formulário não foi totalmente preenchido.')
        } else if (status === 'Invalid password'){
            req.flash('error', 'Sua senha deve ter 6 ou mais caracteres.')
        } else if (status === 'Invalid email'){
            req.flash('error', 'Esse email é inválido.')
        }else if (status === 'User already exists'){
            req.flash('error', 'Esse email já está cadastrado.')
        } else {
            req.flash('success', 'Sua conta foi criada. Por favor, confirme seu email.')
        }

        return res.redirect('/auth')
    },

    async registerToken(req, res, next) {
        const token = req.params.token
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
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
            req.flash('error', 'Esse link de confirmação expirou. Por favor, registre-se novamente.')
            return res.redirect('/auth')
        }

        await User.checkConfirmAccountToken(decodedToken.id)
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

    async createPlaceholder(req, res, next) {
        await User.createPlaceholder()
            .then(user => {
                req.login(user, err => {
                    if(err) return next(err)

                    req.session.cookie.maxAge = 10 * 60 * 1000
                    req.flash('success', 'Bem-vindo(a)! Lembre-se que essa é uma conta temporária e será deletada.')
                    return res.redirect('/profile')
                })
            })
    },

    ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }

        if (req.path !== '/') {
            req.flash('error', 'Você precisa estar logado para acessar essa página.')
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