module.exports = {
    calculateHourlySalary(profile) {
        const yearlySalary = 12 * profile.monthlySalary

        const weeksPerYear = 52
        const weeksWorkedPerYear = weeksPerYear - profile.vacationWeeksPerYear
        const hoursWorkedPerYear = profile.workHoursPerDay * profile.workDaysPerWeek * weeksWorkedPerYear

        const hourlySalary = yearlySalary / hoursWorkedPerYear

        return hourlySalary
    }
}