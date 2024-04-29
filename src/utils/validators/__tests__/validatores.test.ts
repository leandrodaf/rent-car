import { DateTime } from 'luxon'
import { calculateAge } from '../calculateAge'

describe('calculateAge', () => {
    describe('calculateAge', () => {
        let originalNow: any

        beforeAll(() => {
            originalNow = DateTime.now

            DateTime.now = () => DateTime.local(2023, 4, 28) as any
        })

        afterAll(() => {
            DateTime.now = originalNow
        })

        it('should return true if age is exactly the minimum age', () => {
            const testDate = '2005-04-28'
            const minAge = 18
            expect(calculateAge(testDate, minAge)).toBe(true)
        })

        it('should return false if age is less than the minimum age', () => {
            const testDate = '2005-04-29'
            const minAge = 18
            expect(calculateAge(testDate, minAge)).toBe(false)
        })

        it('should return true if age is more than the minimum age', () => {
            const testDate = '2000-01-01'
            const minAge = 18
            expect(calculateAge(testDate, minAge)).toBe(true)
        })

        it('should return false if the person is almost at the minimum age but not yet there', () => {
            const testDate = '2005-05-01'
            const minAge = 18
            expect(calculateAge(testDate, minAge)).toBe(false)
        })
    })
})
