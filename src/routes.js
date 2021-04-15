const express = require('express')
const routes = express.Router()

const LoginAndRegisterController = require('./controllers/LoginAndRegisterController')
const DashboardController = require('./controllers/DashboardController')
const JobController = require('./controllers/JobController')
const ProfileController = require('./controllers/ProfileController')

routes.get('/login', LoginAndRegisterController.index)
routes.post('/login', (req, res) => res.send('Login'))
routes.post('/register', (req, res) => res.send('Register'))

routes.get('/', DashboardController.index)

routes.get('/job', JobController.index)
routes.post('/job', JobController.create)

routes.get('/job/:id', JobController.edit)
routes.post('/job/:id', JobController.update)
routes.post('/job/delete/:id', JobController.delete)

routes.get('/profile', ProfileController.index)
routes.post('/profile', ProfileController.update)

module.exports = routes