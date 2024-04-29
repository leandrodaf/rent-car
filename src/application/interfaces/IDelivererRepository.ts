import { IDeliverer, IDelivererModel } from '../../domain/Deliverer'

export interface IDelivererRepository {
    create(data: IDeliverer): Promise<IDelivererModel>
}
