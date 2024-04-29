import { IRent, IRentModel } from '../../domain/Rent'

export interface IRentRepository {
    create(data: IRent): Promise<IRentModel>
}
