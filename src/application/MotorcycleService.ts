import { StatusCodes } from 'http-status-codes'
import { IMotorcycle, IMotorcycleModel } from '../domain/Motorcycle'
import { FilterQuery } from '../infrastructure/api/requesters/queries/PaginateQuery'
import { IMotorcycleRepository } from './interfaces/IMotorcycleRepository'
import { IMotorcycleService } from './interfaces/IMotorcycleService'
import { CustomError } from '../utils/handdlers/CustomError'
import { inject, injectable } from 'inversify'
import { TYPES } from '../config/types'
import { IRentRepository } from './interfaces/IRentRepository'

@injectable()
export class MotorcycleService implements IMotorcycleService {
    constructor(
        @inject(TYPES.MotorcycleRespository)
        private readonly motorcycleRepository: IMotorcycleRepository,

        @inject(TYPES.RentRepository)
        private readonly rentRepository: IRentRepository
    ) {}

    async delete(search: Partial<IMotorcycle>): Promise<IMotorcycleModel> {
        if (!search.plate) {
            throw new CustomError('Motorcycle not found', StatusCodes.NOT_FOUND)
        }

        const activeRents =
            await this.rentRepository.findRentsByMotorcyclePlate(search.plate)

        if (activeRents.length > 0) {
            throw new CustomError(
                'Cannot delete motorcycle with rents',
                StatusCodes.BAD_REQUEST
            )
        }

        const motorcycle = await this.motorcycleRepository.delete(search)
        if (!motorcycle) {
            throw new CustomError('Motorcycle not found', StatusCodes.NOT_FOUND)
        }

        return motorcycle
    }

    async updateBy(
        search: Partial<IMotorcycle>,
        data: Partial<IMotorcycle>
    ): Promise<IMotorcycleModel> {
        const motorcycle = await this.motorcycleRepository.update(search, data)

        if (!motorcycle) {
            throw new CustomError('Motorcycle not found', StatusCodes.NOT_FOUND)
        }

        return motorcycle
    }

    create(data: IMotorcycle): Promise<IMotorcycleModel> {
        return this.motorcycleRepository.create(data)
    }

    async paginate(
        search: FilterQuery<Partial<IMotorcycle>>
    ): Promise<IMotorcycleModel[]> {
        const { filters, paginate } = search

        const motorcycles = await this.motorcycleRepository.filter(
            filters,
            paginate
        )

        return motorcycles.length ? motorcycles : []
    }

    public async getAvailability(): Promise<IMotorcycleModel> {
        const motorcycles = await this.motorcycleRepository.firstAvailable()

        if (!motorcycles || motorcycles.length === 0) {
            throw new CustomError(
                'No motorcycles available in stock',
                StatusCodes.NOT_FOUND
            )
        }

        return motorcycles[0]
    }
}
