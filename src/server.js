require('express-async-errors')
const express = require("express")
const server = express()

const routes = require("./routes")
const path = require("path")

const PORT = process.env.PORT || 3000

const { connect } = require("./db/config")

connect()

server.set('view engine', 'ejs')
server.set('views', path.join(__dirname, 'views'))

server.use(express.static("public"))
server.use(express.urlencoded({ extended: true }))

require('./passport')(server)
server.use(routes)

server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))