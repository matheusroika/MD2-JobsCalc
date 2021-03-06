const express = require('express')
const passport = require('passport')
const routes = express.Router()

const AuthController = require('./controllers/AuthController')
const ForgotPasswordController = require('./controllers/ForgotPasswordController')
const DashboardController = require('./controllers/DashboardController')
const JobController = require('./controllers/JobController')
const ProfileController = require('./controllers/ProfileController')

routes.get('/auth', AuthController.forwardAuthenticated, AuthController.index)

routes.get('/auth/placeholder', AuthController.forwardAuthenticated, AuthController.createPlaceholder)

routes.get('/auth/register/:token', AuthController.forwardAuthenticated, AuthController.registerToken)
routes.post('/auth/register', AuthController.forwardAuthenticated, AuthController.register)

routes.post('/auth/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/auth', failureFlash: true }))
routes.get('/auth/logout', AuthController.ensureAuthenticated, AuthController.logout)

routes.post('/auth/forgot', AuthController.forwardAuthenticated, ForgotPasswordController.sendToken)
routes.get('/auth/forgot/:token', AuthController.forwardAuthenticated, ForgotPasswordController.validateToken)
routes.post('/auth/forgot/:token', AuthController.forwardAuthenticated, ForgotPasswordController.createPassword)

routes.get('/', AuthController.ensureAuthenticated, DashboardController.index)

routes.get('/job', AuthController.ensureAuthenticated, JobController.index)
routes.post('/job', AuthController.ensureAuthenticated, JobController.create)

routes.get('/job/:id', AuthController.ensureAuthenticated, JobController.edit)
routes.post('/job/:id', AuthController.ensureAuthenticated, JobController.update)
routes.post('/job/delete/:id', AuthController.ensureAuthenticated, JobController.delete)
routes.post('/job/end/:id', AuthController.ensureAuthenticated, JobController.end)

routes.get('/profile', AuthController.ensureAuthenticated, ProfileController.index)
routes.post('/profile/update', AuthController.ensureAuthenticated, ProfileController.update)
routes.post('/profile/calculate', AuthController.ensureAuthenticated, ProfileController.calculate)
routes.post('/profile/delete', AuthController.ensureAuthenticated, ProfileController.delete)

routes.get('/profile/change-email', AuthController.ensureAuthenticated, ProfileController.changeEmailPage)
routes.post('/profile/change-email', AuthController.ensureAuthenticated, ProfileController.changeEmail)
routes.get('/profile/change-email/:token', AuthController.ensureAuthenticated, ProfileController.validateToken)

routes.get('/profile/change-password', AuthController.ensureAuthenticated, ProfileController.changePasswordPage)
routes.post('/profile/change-password', AuthController.ensureAuthenticated, ProfileController.changePassword)


routes.use((error, req, res, next) => {
    console.log('Untreated error: ' + error)
    return res.status(500).json({ error: error.toString() });
}) 

module.exports = routes