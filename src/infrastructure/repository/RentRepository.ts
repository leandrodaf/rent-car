import { injectable } from 'inversify'
import { IRentRepository } from '../../application/interfaces/IRentRepository'
import { IRent, IRentModel, Rent, RentStatus } from '../../domain/Rent'
import { buildPaginate } from './Paginate'

@injectable()
export class RentRepository implements IRentRepository {
    update(id: string, data: Partial<IRent>): Promise<IRentModel | null> {
        return Rent.findByIdAndUpdate(id, data)
    }

    create(data: IRent): Promise<IRentModel> {
        return Rent.create(data)
    }

    filter(
        delivererId: string,
        filters: Partial<IRent> | null,
        paginate?: { page: number; perPage: number } | undefined
    ): Promise<IRentModel[]> {
        let query = Rent.find({ ...filters, deliverer: delivererId } || {})

        query = buildPaginate<IRent>(paginate, query)

        return query.exec()
    }

    findRentedByPlate(
        delivererId: string,
        plate: String
    ): Promise<IRentModel | null> {
        return Rent.findOne({
            deliverer: delivererId,
            status: RentStatus.RENTED,
        })
            .populate({
                path: 'motorcycle',
                match: { plate },
            })
            .exec()
    }

    findRentsByMotorcyclePlate(plate: string): Promise<IRentModel[]> {
        return Rent.find()
            .populate({
                path: 'motorcycle',
                match: { plate: plate },
                select: 'plate',
            })
            .exec()
            .then((rents) =>
                rents.filter(
                    (rent) => rent.motorcycle && rent.motorcycle.plate === plate
                )
            )
    }
}
