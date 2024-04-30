import { PriceCalculated } from '../../../application/interfaces/IRentBudgetService'
import { IRentPlan } from '../../../domain/Rent'

export class ExpectedPriceResource {
    totalCost: number
    plan: IRentPlan
    totalDaysUsed: number
    startDate: Date
    endDate: Date
    deliveryDate: Date

    constructor(data: PriceCalculated, deliveryDate: Date) {
        this.plan = data.rent.plan
        this.totalCost = data.totalCost
        this.totalDaysUsed = data.totalDaysUsed
        this.deliveryDate = deliveryDate
        this.startDate = data.rent.startDate
        this.endDate = data.rent.endDate
    }
}
