const Database = require('./config')

async function init() {
    const db = await Database()

    await db.exec(
        `CREATE TABLE profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            avatar TEXT,
            monthlyBudget INTEGER,
            daysPerWeek INTEGER,
            hoursPerDay INTEGER,
            vacationPerYear INTEGER,
            hourValue FLOAT
        );`
    )

    await db.exec(
        `CREATE TABLE jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            dailyHours INTEGER,
            totalHours INTEGER,
            createdAt DATETIME
        );`
    )

    await db.run(
        `INSERT INTO profiles (
            name,
            avatar,
            monthlyBudget,
            daysPerWeek,
            hoursPerDay,
            vacationPerYear
        ) VALUES (
            "Matheus",
            "https://github.com/matheusroika.png",
            5000,
            5,
            6,
            4
        );`
    )

    await db.run(
        `INSERT INTO jobs (
            name,
            dailyHours,
            totalHours,
            createdAt
        ) VALUES (
            "Pizzaria Guloso",
            2,
            1,
            1618323491386
        );`
    )

    await db.run(
        `INSERT INTO jobs (
            name,
            dailyHours,
            totalHours,
            createdAt
        ) VALUES (
            "OneTwo Project",
            3,
            47,
            1618323491386
        );`
    )

    await db.close()
}

init()