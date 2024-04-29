import { IMotorcycle, IMotorcycleModel } from '../../domain/Motorcycle'

export interface IMotorcycleRespository {
    create(data: IMotorcycle): Promise<IMotorcycleModel>
}
