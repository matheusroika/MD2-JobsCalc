const { connect, database, closeConnection } = require('./config')

const user = {
    "email": "matheusroika@gmail.com",
    "password": 12345678,
    "profile": {
        "name": "Matheus",
        "lastName": "Roika",
        "avatar": "https://github.com/matheusroika.png",
        "monthlySalary": 5000,
        "workDaysPerWeek": 5,
        "workHoursPerDay": 5,
        "vacationWeeksPerYear": 4,
        "workHourValue": 50
    },
    "jobs": [
        {   
            "id": 1,
            "name": "Pizzaria Guloso",
            "dailyHoursOfWork": 2,
            "totalHoursOfWork": 20,
            "createdAt": Date.now()
        }
    ]
};

(async () => {
    await connect()
    await database().then((db) => db.collection("users").insertOne(user))
    await closeConnection()
})()