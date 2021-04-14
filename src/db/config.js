const MongoClient = require('mongodb').MongoClient;
//import credentials to authenticate to the database
const { user, password, uri } = require('./credentials')
const url = `mongodb+srv://${user}:${password}@${uri}?retryWrites=true&w=majority`;

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