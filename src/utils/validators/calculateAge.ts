import { DateTime } from 'luxon'

export function calculateAge(birthDate: string, minAge: number): boolean {
    const birthDateObj = DateTime.fromISO(birthDate)
    const today = DateTime.now()
    const age = today.year - birthDateObj.year
    const monthDayCheck =
        today.month < birthDateObj.month ||
        (today.month === birthDateObj.month && today.day < birthDateObj.day)
    const calculatedAge = monthDayCheck ? age - 1 : age
    return calculatedAge >= minAge
}
