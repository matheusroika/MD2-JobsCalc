const { connect, disconnect } = require('./config')
const { User } = require('../model/User')

const user = new User({
    email: "matheusroika@gmail.com",
    password: "$argon2i$v=19$m=4096,t=3,p=1$VyTnOKHPmK87q30DeiUe/w$SMWJbNgZecHQLgUyNvH0gev5H+sWRUIf8BKXnbaU/sM",
    name: "Matheus",
    lastName: "Roika",
    avatar: "https://github.com/matheusroika.png",
    monthlySalary: 5000,
    workDaysPerWeek: 5,
    workHoursPerDay: 5,
    vacationWeeksPerYear: 4,
    workHourValue: 50,
    jobs: [
        {
            _id: 1,
            name: "Pizzaria Guloso",
            dailyHoursOfWork: 2,
            totalHoursOfWork: 20
        }
    ]
});

(async () => {
    try {
        await connect()
        await user.save()
        await disconnect().then(process.exit())   
    } catch (e) {
        console.log(e)
    }
})()
