const mongoose = require('mongoose')

const url = process.env.DB_URI

module.exports = {
    async connect() {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
                .then(console.log('Connected to MongoDB'))
        } catch(e) {
            console.log('db/config.js connect error: ' + e)
        }
    },

    async disconnect() {
        try {
            await mongoose.disconnect()
                .then(console.log('Disconnect from MongoDB'))
        } catch(e) {
            console.log('db/config.js disconnect error: ' + e)
        }
    }
}