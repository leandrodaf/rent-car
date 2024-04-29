import { IDeliverer, IDelivererModel } from '../domain/Deliverer'
import { FilterQuery } from '../infrastructure/api/requesters/queries/PaginateQuery'
import { IDelivererRepository } from './interfaces/IDelivererRepository'
import { IDelivererService } from './interfaces/IDelivererService'

export class DelivererService implements IDelivererService {
    constructor(private readonly delivererRepository: IDelivererRepository) {}

    async paginate(
        search: FilterQuery<Partial<IDeliverer>>
    ): Promise<IDelivererModel[]> {
        const { filters, paginate } = search

        const deliveries = await this.delivererRepository.filter(
            filters,
            paginate
        )

        return deliveries.length ? deliveries : []
    }

    registerDeliverer(deliverer: IDeliverer): Promise<IDelivererModel> {
        return this.delivererRepository.create(deliverer)
    }
}
