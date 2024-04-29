import { IMotorcycle, IMotorcycleModel } from '../../domain/Motorcycle'

export interface IMotorcycleService {
    create(data: IMotorcycle): Promise<IMotorcycleModel>
}
