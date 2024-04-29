import { IRent, IRentModel } from '../../domain/Rent'
import { PaginateQueryType } from './IRepositoryPaginate'

export interface IRentRepository {
    create(data: IRent): Promise<IRentModel>

    filter(
        filters: Partial<IRent> | null,
        paginate?: PaginateQueryType
    ): Promise<IRentModel[]>
}
