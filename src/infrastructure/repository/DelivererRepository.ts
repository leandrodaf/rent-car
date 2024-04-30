import { injectable } from 'inversify'
import { IDelivererRepository } from '../../application/interfaces/IDelivererRepository'
import { Deliverer, IDeliverer, IDelivererModel } from '../../domain/Deliverer'
import { buildPaginate } from './Paginate'

@injectable()
export class DelivererRepository implements IDelivererRepository {
    findById(id: string): Promise<IDelivererModel | null> {
        return Deliverer.findById(id)
    }

    update(
        id: string,
        data: Partial<IDeliverer>
    ): Promise<IDelivererModel | null> {
        return Deliverer.findOneAndUpdate({ _id: id }, data, {
            new: true,
            runValidators: true,
        })
    }

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
