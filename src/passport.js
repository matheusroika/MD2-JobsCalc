const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const flash = require('connect-flash')
const argon2 = require('argon2')

const { User } = require('./model/User')

module.exports = (server) => {
    server.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        name: 'sid',
        cookie: {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            // recommended you use this setting in production if you have a well-known domain you want to restrict the cookies to.
            // domain: 'your.domain.com',
            // recommended you use this setting in production if your site is published using HTTPS
            // secure: true,
        }
    }))

    server.use(flash())

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (userId, done) => {
        await User.findById(userId)
            .then(user => done(null, user))
            .catch(err => done(err))
    })

    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        const errorMsg = 'Email ou senha inválidos'

        await User.findOne({email})
            .then(async user => {
                if (!user) {
                    return done(null, false, {message: errorMsg})
                } else if (!user.active) {
                    return done(null, false, {message: 'Sua conta não foi confirmada. Por favor, cheque seu email.'})
                } else if (user.isPlaceholder) {
                    return done(null, false, {message: 'Você não pode logar em uma conta temporária.'})
                }

                const isMatch = await argon2.verify(String(user.password), String(password))
                isMatch ? done(null, user) : done(null, false, { message: errorMsg })      
            })
            .catch(done)
    }))

    server.use(passport.initialize())
    server.use(passport.session())
}