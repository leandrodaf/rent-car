import { IRentRepository } from '../../application/interfaces/IRentRepository'
import { IRent, IRentModel, Rent } from '../../domain/Rent'
import { buildPaginate } from './Paginate'

export class RentRepository implements IRentRepository {
    create(data: IRent): Promise<IRentModel> {
        return Rent.create(data)
    }

    filter(
        filters: Partial<IRent> | null,
        paginate?: { page: number; perPage: number } | undefined
    ): Promise<IRentModel[]> {
        let query = Rent.find(filters || {})

        query = buildPaginate<IRent>(paginate, query)

        return query.exec()
    }
}
