import { IRentalPlan } from '../../../application/interfaces/IRentPlanRepository'
import { RentPlanRepository } from '../RentPlanRepository'

describe('RentPlanRepository', () => {
    let rentPlanRepository: RentPlanRepository

    beforeEach(() => {
        rentPlanRepository = new RentPlanRepository()
    })

    describe('findBy', () => {
        it('should return the smallest suitable rental plan for the requested days', () => {
            const daysRequested = 16
            const expectedPlan: IRentalPlan = { days: 30, dailyRate: 2200 }

            const result = rentPlanRepository.findBy(daysRequested)

            expect(result).toEqual(expectedPlan)
        })

        it('should return undefined if no suitable plan is found', () => {
            const daysRequested = 51

            const result = rentPlanRepository.findBy(daysRequested)

            expect(result).toBeUndefined()
        })

        it('should return the exact plan when days match exactly', () => {
            const daysRequested = 15
            const expectedPlan: IRentalPlan = { days: 15, dailyRate: 2800 }

            const result = rentPlanRepository.findBy(daysRequested)

            expect(result).toEqual(expectedPlan)
        })
    })
})
