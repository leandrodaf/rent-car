import { IRentModel } from '../../domain/Rent'

export interface PriceCalculated {
    totalCost: number
    rent: IRentModel
    totalDaysUsed: number
}

export interface IRentBudgetService {
    expectedReturn(
        delivererId: string,
        plate: string,
        deliveryDate: Date
    ): Promise<PriceCalculated>

    finalizeRent(
        delivererId: string,
        plate: string,
        deliveryDate: Date
    ): Promise<IRentModel>
}
