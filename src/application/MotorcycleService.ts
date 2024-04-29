import { IMotorcycle, IMotorcycleModel } from '../domain/Motorcycle'
import { FilterQuery } from '../infrastructure/api/requesters/queries/PaginateQuery'
import { IMotorcycleRespository } from './interfaces/IMotorcycleRespository'
import { IMotorcycleService } from './interfaces/IMotorcycleService'

export class MotorcycleService implements IMotorcycleService {
    constructor(
        private readonly motorcycleRespository: IMotorcycleRespository
    ) {}

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
