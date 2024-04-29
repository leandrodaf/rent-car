import { IDeliverer, IDelivererModel } from '../../domain/Deliverer'

export interface IDelivererService {
    registerDeliverer(data: IDeliverer): Promise<IDelivererModel>
}
