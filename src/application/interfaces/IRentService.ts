import { IRent, IRentModel } from '../../domain/Rent'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'

export interface IRentService {
    renting(id: string, endDate: Date): Promise<IRentModel>

    paginate(
        delivererId: string,
        search: FilterQuery<Partial<IRent>>
    ): Promise<IRentModel[]>

    processRentCreated(message: string): Promise<IRentModel | null>
}
