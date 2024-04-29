import { StatusCodes } from 'http-status-codes'
import { IMotorcycle, IMotorcycleModel } from '../domain/Motorcycle'
import { FilterQuery } from '../infrastructure/api/requesters/queries/PaginateQuery'
import { IMotorcycleRespository } from './interfaces/IMotorcycleRespository'
import { IMotorcycleService } from './interfaces/IMotorcycleService'
import { CustomError } from '../utils/handdlers/CustomError'

export class MotorcycleService implements IMotorcycleService {
    constructor(
        private readonly motorcycleRespository: IMotorcycleRespository
    ) {}

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
