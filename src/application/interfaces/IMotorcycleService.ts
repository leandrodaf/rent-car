import { IMotorcycle, IMotorcycleModel } from '../../domain/Motorcycle'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'

export interface IMotorcycleService {
    create(data: IMotorcycle): Promise<IMotorcycleModel>

    paginate(
        search: FilterQuery<Partial<IMotorcycle>>
    ): Promise<IMotorcycleModel[]>
}
