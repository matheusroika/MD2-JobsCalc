const MongoClient = require('mongodb').MongoClient;

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}?retryWrites=true&w=majority`;

const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = {
    async database() {
        try {
            return await client.db('discover02')
        } catch(e) {
            console.log('db/config.js database() error: ' + e)
        }       
    },

    async connect() {
        try {
            await client.connect().then(console.log('Connected to MongoDB'))
        } catch(e) {
            console.log('db/config.js connect() error: ' + e)
        }
    },

    async closeConnection() {
        try {
            await client.close().then(console.log('Closed connection to MongoDB'))
        } catch (e) {
            console.log('db/config.js closeConnection() error: ' + e)
        }
    }   
}