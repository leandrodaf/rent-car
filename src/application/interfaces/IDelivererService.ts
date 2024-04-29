import { IDeliverer, IDelivererModel } from '../../domain/Deliverer'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'

export interface IDelivererService {
    registerDeliverer(data: IDeliverer): Promise<IDelivererModel>

    paginate(
        search: FilterQuery<Partial<IDeliverer>>
    ): Promise<IDelivererModel[]>
}
