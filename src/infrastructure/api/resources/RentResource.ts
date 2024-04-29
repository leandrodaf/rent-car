import { IMotorcycle } from '../../../domain/Motorcycle'
import { IRent, IRentModel, RentStatus } from '../../../domain/Rent'

export class RentResource implements Partial<IRent> {
    motorcycle: IMotorcycle | undefined
    plan: { days: number; dailyRate: number }
    startDate: Date
    endDate: Date
    deliveryForecastDate: Date
    totalCost: number
    status: RentStatus

    constructor(motorcycle: IRentModel) {
        this.motorcycle = motorcycle.motorcycle
        this.plan = motorcycle.plan
        this.startDate = motorcycle.startDate
        this.endDate = motorcycle.endDate
        this.deliveryForecastDate = motorcycle.deliveryForecastDate
        this.totalCost = motorcycle.totalCost
        this.status = motorcycle.status
    }
}
