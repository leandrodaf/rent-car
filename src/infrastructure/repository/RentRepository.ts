import { IRentRepository } from '../../application/interfaces/IRentRepository'
import { IRent, IRentModel, Rent } from '../../domain/Rent'

export class RentRepository implements IRentRepository {
    create(data: IRent): Promise<IRentModel> {
        return Rent.create(data)
    }
}
