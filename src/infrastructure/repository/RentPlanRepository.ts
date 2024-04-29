import {
    IRentPlanRepository,
    IRentalPlan,
} from '../../application/interfaces/IRentPlanRepository'

export class RentPlanRepository implements IRentPlanRepository {
    private static rentalPlans: IRentalPlan[] = [
        { days: 7, dailyRate: 3000 },
        { days: 15, dailyRate: 2800 },
        { days: 30, dailyRate: 2200 },
        { days: 45, dailyRate: 2000 },
        { days: 50, dailyRate: 1800 },
    ]

    findBy(daysRequested: number): IRentalPlan | undefined {
        const sortedPlans = RentPlanRepository.rentalPlans.sort(
            (a, b) => a.days - b.days
        )

        const suitablePlan = sortedPlans.find(
            (plan) => plan.days >= daysRequested
        )

        return suitablePlan
    }
}
