import { StatusCodes } from 'http-status-codes'
import { IMotorcycle, IMotorcycleModel } from '../domain/Motorcycle'
import { FilterQuery } from '../infrastructure/api/requesters/queries/PaginateQuery'
import { IMotorcycleRepository } from './interfaces/IMotorcycleRepository'
import { IMotorcycleService } from './interfaces/IMotorcycleService'
import { CustomError } from '../utils/handdlers/CustomError'
import { inject, injectable } from 'inversify'
import { TYPES } from '../config/types'

@injectable()
export class MotorcycleService implements IMotorcycleService {
    constructor(
        @inject(TYPES.MotorcycleRespository)
        private readonly motorcycleRespository: IMotorcycleRepository
    ) {}

    async delete(search: Partial<IMotorcycle>): Promise<IMotorcycleModel> {
        const motorcycle = await this.motorcycleRespository.delete(search)

        if (!motorcycle) {
            throw new CustomError('Motorcycle not found', StatusCodes.NOT_FOUND)
        }

        return motorcycle
    }

    async updateBy(
        search: Partial<IMotorcycle>,
        data: Partial<IMotorcycle>
    ): Promise<IMotorcycleModel> {
        const motorcycle = await this.motorcycleRespository.update(search, data)

        if (!motorcycle) {
            throw new CustomError('Motorcycle not found', StatusCodes.NOT_FOUND)
        }

        return motorcycle
    }

    create(data: IMotorcycle): Promise<IMotorcycleModel> {
        return this.motorcycleRespository.create(data)
    }

    async paginate(
        search: FilterQuery<Partial<IMotorcycle>>
    ): Promise<IMotorcycleModel[]> {
        const { filters, paginate } = search

        const motorcycles = await this.motorcycleRespository.filter(
            filters,
            paginate
        )

        return motorcycles.length ? motorcycles : []
    }
}
