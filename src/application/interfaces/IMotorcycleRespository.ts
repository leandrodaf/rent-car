import { IMotorcycle, IMotorcycleModel } from '../../domain/Motorcycle'
import { PaginateQueryType } from './IRepositoryPaginate'

export interface IMotorcycleRespository {
    create(data: IMotorcycle): Promise<IMotorcycleModel>

    filter(
        filters: Partial<IMotorcycle> | null,
        paginate?: PaginateQueryType
    ): Promise<IMotorcycleModel[]>

    update(
        search: Partial<IMotorcycle>,
        data: Partial<IMotorcycle>
    ): Promise<IMotorcycleModel | null>
}
