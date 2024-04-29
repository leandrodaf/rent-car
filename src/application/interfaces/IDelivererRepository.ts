import { IDeliverer, IDelivererModel } from '../../domain/Deliverer'
import { PaginateQueryType } from './IRepositoryPaginate'

export interface IDelivererRepository {
    create(data: IDeliverer): Promise<IDelivererModel>

    filter(
        filters: Partial<IDeliverer> | null,
        paginate?: PaginateQueryType
    ): Promise<IDelivererModel[]>
}
