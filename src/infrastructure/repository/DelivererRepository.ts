import { IDelivererRepository } from '../../application/interfaces/IDelivererRepository'
import { Deliverer, IDeliverer, IDelivererModel } from '../../domain/Deliverer'

export class DelivererRepository implements IDelivererRepository {
    create(data: IDeliverer): Promise<IDelivererModel> {
        return Deliverer.create(data)
    }
}
