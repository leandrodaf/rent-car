import { IRent, IRentModel } from '../../domain/Rent'
import { PaginateQueryType } from './IRepositoryPaginate'

export interface IRentRepository {
    create(data: IRent): Promise<IRentModel>

    filter(
        filters: Partial<IRent> | null,
        paginate?: PaginateQueryType
    ): Promise<IRentModel[]>

    findRentedByPlate(
        delivererId: string,
        plate: String
    ): Promise<IRentModel | null>

    update(id: string, data: Partial<IRent>): Promise<IRentModel | null>
}
