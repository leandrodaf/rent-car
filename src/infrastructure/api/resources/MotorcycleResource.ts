import { IMotorcycle, IMotorcycleModel } from '../../../domain/Motorcycle'

export class MotorcycleResource implements Partial<IMotorcycle> {
    plate: string
    year: number
    modelName: string

    constructor(motorcycle: IMotorcycleModel) {
        this.plate = motorcycle.plate
        this.year = motorcycle.year
        this.modelName = motorcycle.modelName
    }
}
