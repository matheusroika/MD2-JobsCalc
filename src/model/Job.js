const { database } = require('../db/config')


module.exports = {
    async get() {
        const db = await database()
        const filter = {"email":"matheusroika@gmail.com"}
        //projection is used to control which fields are returned by the find function
        //0 = don't return, 1 = return
        const projection = {projection: { _id: 0, jobs: 1}}

        const { jobs } = await db.collection('users').findOne(filter, projection)

        return jobs
    },

    async create(newData) {
        const db = await database()
        const filter = {"email":"matheusroika@gmail.com"}

        newData = {
            ...newData,
            id: Number(newData.id),
            dailyHoursOfWork: Number(newData.dailyHoursOfWork),
            totalHoursOfWork: Number(newData.totalHoursOfWork)
        }

        await db.collection("users").updateOne(
            filter,
            {$push: {
                "jobs": newData }})
    },

    async update(updatedData, id) {
        const db = await database()
        const filter = {"email":"matheusroika@gmail.com"}
        const jobsDotNotation = `jobs.${id - 1}`

        await db.collection('users').updateOne(
            filter,
            {$set: {
                [`jobs.${id - 1}.name`]: updatedData.name,
                [`jobs.${id - 1}.dailyHoursOfWork`]: Number(updatedData.dailyHoursOfWork),
                [`jobs.${id - 1}.totalHoursOfWork`]: Number(updatedData.totalHoursOfWork)}})
    },

    async delete(id) {
        const db = await database()
        const filter = {"email":"matheusroika@gmail.com"}

        await db.collection("users").updateOne(
            filter, 
            {$pull: {
                "jobs": {
                    "id": Number(id)}}})
    }
}