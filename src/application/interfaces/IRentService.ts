import { IRentModel } from '../../domain/Rent'

export interface IRentService {
    renting(id: string, startDate: Date, endDate: Date): Promise<IRentModel>
}
