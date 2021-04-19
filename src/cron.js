const cron = require('node-cron');

const { User } = require('./model/User')

cron.schedule('0 */2 * * *', async () => {
    console.log('Cleaning inactive and placeholder users');
    const inactiveUsers = await User.find({ active: false })
    inactiveUsers.map(async user => {
        if (!user.active) {
            const currentDate = Date.now()
            const createdAtInMs = user.createdAt.getTime()
            const dayInMs = 24 * 60 * 60 * 1000

            if (currentDate > createdAtInMs + dayInMs) {
                await User.findByIdAndDelete(user._id)
                console.log('Cleaning 1 inactive user')
            }
        }
    })

    const placeholderUsers = await User.deleteMany({ isPlaceholder: true })
    console.log('Clean ' + placeholderUsers.deletedCount + ' placeholder users')
});