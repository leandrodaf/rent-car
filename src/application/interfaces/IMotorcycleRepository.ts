import { IMotorcycle, IMotorcycleModel } from '../../domain/Motorcycle'
import { PaginateQueryType } from './IRepositoryPaginate'

export interface IMotorcycleRepository {
    create(data: IMotorcycle): Promise<IMotorcycleModel>

    filter(
        filters: Partial<IMotorcycle> | null,
        paginate?: PaginateQueryType
    ): Promise<IMotorcycleModel[]>

    update(
        search: Partial<IMotorcycle>,
        data: Partial<IMotorcycle>
    ): Promise<IMotorcycleModel | null>

    delete(search: Partial<IMotorcycle>): Promise<IMotorcycleModel | null>
}
