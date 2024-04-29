import { IMotorcycleRespository } from '../../application/interfaces/IMotorcycleRespository'
import {
    IMotorcycle,
    IMotorcycleModel,
    Motorcycle,
} from '../../domain/Motorcycle'

export class MotorcycleRespository implements IMotorcycleRespository {
    create(data: IMotorcycle): Promise<IMotorcycleModel> {
        return Motorcycle.create(data)
    }
}
