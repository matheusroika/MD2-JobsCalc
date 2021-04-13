module.exports = {
    calculateHourlyBudget(profile) {
        const yearlyBudget = 12 * profile.monthlyBudget

        const weeksPerYear = 52
        const weeksWorkedPerYear = weeksPerYear - profile.vacationPerYear
        const hoursWorkedPerYear = profile.hoursPerDay * profile.daysPerWeek * weeksWorkedPerYear

        const hourlyBudget = yearlyBudget / hoursWorkedPerYear

        return hourlyBudget
    }
}