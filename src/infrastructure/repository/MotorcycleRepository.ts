import { injectable } from 'inversify'
import { IMotorcycleRepository } from '../../application/interfaces/IMotorcycleRepository'
import {
    IMotorcycle,
    IMotorcycleModel,
    Motorcycle,
} from '../../domain/Motorcycle'
import { buildPaginate } from './Paginate'

@injectable()
export class MotorcycleRepository implements IMotorcycleRepository {
    delete(search: Partial<IMotorcycle>): Promise<IMotorcycleModel | null> {
        return Motorcycle.findOneAndDelete(search)
    }

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
