import { IMotorcycle, IMotorcycleModel } from '../../../domain/Motorcycle'
import { IRent, IRentModel, RentStatus } from '../../../domain/Rent'
import { MotorcycleResource } from './MotorcycleResource'

export class RentResource implements Partial<IRent> {
    motorcycle: IMotorcycle | undefined
    plan: { days: number; dailyRate: number }
    startDate: Date
    endDate: Date
    deliveryForecastDate: Date
    totalCost: number
    status: RentStatus

    constructor(rent: IRentModel) {
        if (rent.motorcycle) {
            this.motorcycle = new MotorcycleResource(
                rent.motorcycle as IMotorcycleModel
            )
        }
        this.plan = rent.plan
        this.startDate = rent.startDate
        this.endDate = rent.endDate
        this.deliveryForecastDate = rent.deliveryForecastDate
        this.totalCost = rent.totalCost
        this.status = rent.status
    }
}
