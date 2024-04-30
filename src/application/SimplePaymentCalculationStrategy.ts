import { DateTime } from 'luxon'
import { IRent, IRentModel } from '../domain/Rent'
import { ISimplePaymentCalculationStrategy } from './interfaces/SimplePaymentCalculationStrategy'

export class SimplePaymentCalculationStrategy
    implements ISimplePaymentCalculationStrategy
{
    private static readonly LATE_PENALTY_PER_DAY_CENTS = 5000 // R$50.00 per day in cents

    public calculateCost(
        rental: IRentModel,
        deliveryDateTime: DateTime
    ): { totalCost: number; totalDaysUsed: number } {
        const expectedEndDate = DateTime.fromJSDate(rental.endDate)
        const startDate = DateTime.fromJSDate(rental.startDate)
        const totalDaysUsed = deliveryDateTime.diff(startDate, 'days').days + 1

        if (deliveryDateTime < expectedEndDate) {
            const cost = this.calculateCostForEarlyReturn(totalDaysUsed, rental)
            return { totalCost: cost, totalDaysUsed }
        }

        if (deliveryDateTime > expectedEndDate) {
            const cost = this.calculateCostForLateReturn(
                totalDaysUsed,
                rental,
                deliveryDateTime,
                expectedEndDate
            )
            return { totalCost: cost, totalDaysUsed }
        }

        // If delivered on the exact end date
        const baseCost = rental.plan.days * rental.plan.dailyRate
        return { totalCost: baseCost, totalDaysUsed: rental.plan.days }
    }

    private calculateCostForEarlyReturn(
        daysUsed: number,
        rental: IRent
    ): number {
        const actualUsedCost = daysUsed * rental.plan.dailyRate // Cost of days used

        const daysUnfulfilled = rental.plan.days - daysUsed // Unused days
        const unfulfilledDaysCost = daysUnfulfilled * rental.plan.dailyRate // Cost of unused days

        const penaltyRate = this.getPenaltyRate(rental.plan.days) // Penalty rate based on days in the plan
        const penalty = unfulfilledDaysCost * penaltyRate // Penalty amount

        return actualUsedCost + penalty // Total cost of penalty applied
    }

    private calculateCostForLateReturn(
        daysUsed: number,
        rental: IRent,
        deliveryDateTime: DateTime,
        expectedEndDate: DateTime
    ): number {
        const baseCost = rental.plan.days * rental.plan.dailyRate
        const daysLate = deliveryDateTime.diff(expectedEndDate, 'days').days
        const additionalCost =
            daysLate *
            SimplePaymentCalculationStrategy.LATE_PENALTY_PER_DAY_CENTS

        return baseCost + additionalCost
    }

    private getPenaltyRate(days: number): number {
        switch (days) {
            case 7:
                return 0.2 // 20% penalty for early return
            case 15:
                return 0.4 // 40% penalty for early return
            default:
                return 0 // No penalty for other plans
        }
    }
}
