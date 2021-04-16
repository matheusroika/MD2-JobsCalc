const mongoose = require('mongoose')

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}?retryWrites=true&w=majority`;

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