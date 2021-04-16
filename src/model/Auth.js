const { database } = require('../db/config')

const argon2 = require('argon2')

module.exports = {
    async createUser(user) {
        if (!user.email || !user.password || !user.name || !user.lastName) return 'Missing field'
        if (!/^\S+@\S+$/.test(user.email)) return 'Invalid email'

        const db = await database()

        const userCheck = await db.collection('users').findOne({'email': user.email})
        if (userCheck) return 'User already exists'

        user.password = await argon2.hash(user.password)
        
        const newUser = {
            "email": user.email,
            "password": user.password,
            "profile": {
                "name": user.name,
                "lastName": user.lastName,
                "avatar": "",
                "monthlySalary": 0,
                "workDaysPerWeek": 0,
                "workHoursPerDay": 0,
                "vacationWeeksPerYear": 0,
                "workHourValue": 0
            },
            "jobs": []
        }

        await db.collection('users').insertOne(newUser)

        return true
    }
}