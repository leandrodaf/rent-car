import { IDelivererRepository } from '../../application/interfaces/IDelivererRepository'
import { Deliverer, IDeliverer, IDelivererModel } from '../../domain/Deliverer'
import { buildPaginate } from './Paginate'

export class DelivererRepository implements IDelivererRepository {
    filter(
        filters: Partial<IDeliverer> | null,
        paginate?: { page: number; perPage: number } | undefined
    ): Promise<IDelivererModel[]> {
        let query = Deliverer.find(filters || {})

        query = buildPaginate<IDelivererModel>(paginate, query)

        return query.exec()
    }

    create(data: IDeliverer): Promise<IDelivererModel> {
        return Deliverer.create(data)
    }
}
