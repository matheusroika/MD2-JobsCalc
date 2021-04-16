const express = require('express')
const passport = require('passport')
const routes = express.Router()

const AuthController = require('./controllers/AuthController')
const DashboardController = require('./controllers/DashboardController')
const JobController = require('./controllers/JobController')
const ProfileController = require('./controllers/ProfileController')

routes.get('/auth', AuthController.forwardAuthenticated, AuthController.index)
routes.get('/logout', AuthController.ensureAuthenticated, AuthController.logout)
routes.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/auth', failureFlash: true }))
routes.post('/register', AuthController.register)

routes.get('/', AuthController.ensureAuthenticated, DashboardController.index)

routes.get('/job', AuthController.ensureAuthenticated, JobController.index)
routes.post('/job', AuthController.ensureAuthenticated, JobController.create)

routes.get('/job/:id', AuthController.ensureAuthenticated, JobController.edit)
routes.post('/job/:id', AuthController.ensureAuthenticated, JobController.update)
routes.post('/job/delete/:id', AuthController.ensureAuthenticated, JobController.delete)

routes.get('/profile', AuthController.ensureAuthenticated, ProfileController.index)
routes.post('/profile', AuthController.ensureAuthenticated, ProfileController.update)

module.exports = routes