import { DateTime } from 'luxon'
import {
    IRentBudgetService,
    PriceCalculated,
} from './interfaces/IRentBudgetService'
import { CustomError } from '../utils/handdlers/CustomError'
import { StatusCodes } from 'http-status-codes'
import { ISimplePaymentCalculationStrategy } from './interfaces/SimplePaymentCalculationStrategy'
import { IRentRepository } from './interfaces/IRentRepository'
import { IRentModel, RentStatus } from '../domain/Rent'
import { inject, injectable } from 'inversify'
import { TYPES } from '../config/types'

@injectable()
export class RentBudgetService implements IRentBudgetService {
    constructor(
        @inject(TYPES.RentRepository)
        private readonly rentRepository: IRentRepository,
        @inject(TYPES.SimplePaymentCalculationStrategy)
        private readonly simplePaymentCalculationStrategy: ISimplePaymentCalculationStrategy
    ) {}

    async expectedReturn(
        delivererId: string,
        plate: string,
        deliveryDate: Date
    ): Promise<PriceCalculated> {
        const rent = await this.rentRepository.findRentedByPlate(
            delivererId,
            plate
        )

        if (!rent) {
            throw new CustomError('Rent not found', StatusCodes.NOT_FOUND)
        }

        const date = DateTime.fromJSDate(deliveryDate)

        const { totalCost, totalDaysUsed } =
            this.simplePaymentCalculationStrategy.calculateCost(rent, date)

        return { totalCost, rent, totalDaysUsed }
    }

    async finalizeRent(
        delivererId: string,
        plate: string,
        deliveryDate: Date
    ): Promise<IRentModel> {
        const rent = await this.rentRepository.findRentedByPlate(
            delivererId,
            plate
        )

        if (!rent) {
            throw new CustomError('Rent not found', StatusCodes.NOT_FOUND)
        }

        const date = DateTime.fromJSDate(deliveryDate)

        const { totalCost } =
            this.simplePaymentCalculationStrategy.calculateCost(rent, date)

        const updatedRent = await this.rentRepository.update(
            rent._id as string,
            {
                deliveryForecastDate: deliveryDate,
                totalCost,
                status: RentStatus.DONE,
            }
        )

        if (!updatedRent) {
            throw new CustomError('Rent not found', StatusCodes.NOT_FOUND)
        }

        return updatedRent
    }
}
