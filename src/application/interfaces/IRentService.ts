import { IRent, IRentModel } from '../../domain/Rent'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'

export interface IRentService {
    renting(id: string, startDate: Date, endDate: Date): Promise<IRentModel>

    paginate(search: FilterQuery<Partial<IRent>>): Promise<IRentModel[]>
}
