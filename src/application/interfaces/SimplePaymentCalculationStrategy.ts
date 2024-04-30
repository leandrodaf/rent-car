import { DateTime } from 'luxon'
import { IRent } from '../../domain/Rent'

export interface ISimplePaymentCalculationStrategy {
    calculateCost(
        rental: IRent,
        deliveryDateTime: DateTime
    ): { totalCost: number; totalDaysUsed: number }
}
