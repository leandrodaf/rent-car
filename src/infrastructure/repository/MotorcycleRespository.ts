import { IMotorcycleRespository } from '../../application/interfaces/IMotorcycleRespository'
import {
    IMotorcycle,
    IMotorcycleModel,
    Motorcycle,
} from '../../domain/Motorcycle'
import { buildPaginate } from './Paginate'

export class MotorcycleRespository implements IMotorcycleRespository {
    update(
        search: Partial<IMotorcycle>,
        data: Partial<IMotorcycle>
    ): Promise<IMotorcycleModel | null> {
        return Motorcycle.findOneAndUpdate(search, data)
    }

    create(data: IMotorcycle): Promise<IMotorcycleModel> {
        return Motorcycle.create(data)
    }

    filter(
        filters: Partial<IMotorcycle> | null,
        paginate?: { page: number; perPage: number } | undefined
    ): Promise<IMotorcycleModel[]> {
        let query = Motorcycle.find(filters || {})

        query = buildPaginate<IMotorcycleModel>(paginate, query)

        return query.exec()
    }
}
