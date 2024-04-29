import { IDeliverer, IDelivererModel } from '../domain/Deliverer'
import { IDelivererRepository } from './interfaces/IDelivererRepository'
import { IDelivererService } from './interfaces/IDelivererService'

export class DelivererService implements IDelivererService {
    constructor(private readonly delivererRepository: IDelivererRepository) {}

    registerDeliverer(deliverer: IDeliverer): Promise<IDelivererModel> {
        return this.delivererRepository.create(deliverer)
    }
}
