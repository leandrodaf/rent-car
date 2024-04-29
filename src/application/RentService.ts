import { StatusCodes } from 'http-status-codes'
import { DriverLicenseType, IDelivererModel } from '../domain/Deliverer'
import { IRent, IRentModel, RentStatus } from '../domain/Rent'
import { CustomError } from '../utils/handdlers/CustomError'
import { IDelivererService } from './interfaces/IDelivererService'
import { IRentService } from './interfaces/IRentService'
import { DateTime } from 'luxon'
import config from '../config'
import { IRentPlanRepository } from './interfaces/IRentPlanRepository'
import { IRentRepository } from './interfaces/IRentRepository'
import { FilterQuery } from '../infrastructure/api/requesters/queries/PaginateQuery'

export class RentService implements IRentService {
    constructor(
        private readonly rentRepository: IRentRepository,
        private readonly delivererService: IDelivererService,
        private readonly rentPlanRepository: IRentPlanRepository
    ) {}

    async paginate(search: FilterQuery<Partial<IRent>>): Promise<IRentModel[]> {
        const { filters, paginate } = search

        const rents = await this.rentRepository.filter(filters, paginate)

        return rents.length ? rents : []
    }

    private async checkDelivererAuthorization(
        delivererId: string
    ): Promise<IDelivererModel> {
        const deliverer = await this.delivererService.findById(delivererId)

        if (
            !deliverer ||
            ![DriverLicenseType.A, DriverLicenseType.A_B].includes(
                deliverer.driverLicenseType
            )
        ) {
            throw new CustomError(
                'Deliverer is not authorized to rent a motorcycle.',
                StatusCodes.BAD_REQUEST
            )
        }

        return deliverer
    }

    private dateRangeCheck(start: DateTime, end: DateTime) {
        const today = DateTime.now().setZone(config.timezone).startOf('day')

        if (start <= today || end <= today) {
            throw new CustomError(
                'Reservation dates cannot be today or a past date.',
                StatusCodes.BAD_REQUEST
            )
        }
    }

    async renting(
        id: string,
        startDate: Date,
        endDate: Date
    ): Promise<IRentModel> {
        const deliverer = await this.checkDelivererAuthorization(id)

        const start = DateTime.fromJSDate(startDate)
        const end = DateTime.fromJSDate(endDate)

        this.dateRangeCheck(start, end)

        const differenceInDays = Math.ceil(end.diff(start, 'days').days)

        const plan = this.rentPlanRepository.findBy(differenceInDays)

        if (!plan) {
            throw new CustomError(
                'No rental plan available for the specified range dates.',
                StatusCodes.BAD_REQUEST
            )
        }

        const created = await this.rentRepository.create({
            deliverer,
            plan,
            startDate: start.toJSDate(),
            endDate: end.toJSDate(),
            deliveryForecastDate: end.toJSDate(),
            totalCost: 0,
            status: RentStatus.PROCESSING,
        })

        // Disparar para o kafka

        return created
    }
}
