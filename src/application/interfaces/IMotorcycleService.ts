import { IMotorcycle, IMotorcycleModel } from '../../domain/Motorcycle'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'

export interface IMotorcycleService {
    create(data: IMotorcycle): Promise<IMotorcycleModel>

    paginate(
        search: FilterQuery<Partial<IMotorcycle>>
    ): Promise<IMotorcycleModel[]>

    updateBy(
        search: Partial<IMotorcycle>,
        data: Partial<IMotorcycle>
    ): Promise<IMotorcycleModel>

    delete(search: Partial<IMotorcycle>): Promise<IMotorcycleModel>

    getAvailability(): Promise<IMotorcycleModel>
}
