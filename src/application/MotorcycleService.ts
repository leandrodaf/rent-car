import { IMotorcycle, IMotorcycleModel } from '../domain/Motorcycle'
import { IMotorcycleRespository } from './interfaces/IMotorcycleRespository'
import { IMotorcycleService } from './interfaces/IMotorcycleService'

export class MotorcycleService implements IMotorcycleService {
    constructor(
        private readonly motorcycleRespository: IMotorcycleRespository
    ) {}

    create(data: IMotorcycle): Promise<IMotorcycleModel> {
        return this.motorcycleRespository.create(data)
    }
}
