import { IRent, IRentModel } from '../../domain/Rent'

export interface IRentRepository {
    create(data: IRent): Promise<IRentModel>

    filter(
        delivererId: string,
        filters: Partial<IRent> | null,
        paginate?: { page: number; perPage: number } | undefined
    ): Promise<IRentModel[]>

    findRentedByPlate(
        delivererId: string,
        plate: String
    ): Promise<IRentModel | null>

    update(id: string, data: Partial<IRent>): Promise<IRentModel | null>

    findRentsByMotorcyclePlate(plate: string): Promise<IRentModel[]>
}
