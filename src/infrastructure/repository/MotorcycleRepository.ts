import { injectable } from 'inversify'
import { IMotorcycleRepository } from '../../application/interfaces/IMotorcycleRepository'
import {
    IMotorcycle,
    IMotorcycleModel,
    Motorcycle,
} from '../../domain/Motorcycle'
import { buildPaginate } from './Paginate'
import { RentStatus } from '../../domain/Rent'

@injectable()
export class MotorcycleRepository implements IMotorcycleRepository {
    delete(search: Partial<IMotorcycle>): Promise<IMotorcycleModel | null> {
        return Motorcycle.findOneAndDelete(search)
    }

    update(
        search: Partial<IMotorcycle>,
        data: Partial<IMotorcycle>
    ): Promise<IMotorcycleModel | null> {
        return Motorcycle.findOneAndUpdate(search, data)
    }

    create(data: IMotorcycle): Promise<IMotorcycleModel> {
        return Motorcycle.create(data)
    }

    filter(
        filters: Partial<IMotorcycle> | null,
        paginate?: { page: number; perPage: number } | undefined
    ): Promise<IMotorcycleModel[]> {
        let query = Motorcycle.find(filters || {})

        query = buildPaginate<IMotorcycleModel>(paginate, query)

        return query.exec()
    }

    firstAvailable(): Promise<IMotorcycleModel[] | null> {
        return Motorcycle.aggregate([
            {
                // Junção com a coleção de aluguéis
                $lookup: {
                    from: 'rentals', // Especifica a coleção de aluguéis
                    let: { motorcycleId: '$_id' }, // Declara variável local para usar na subconsulta
                    pipeline: [
                        {
                            // Filtra aluguéis ativos (status RENTED)
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                '$motorcycle',
                                                '$$motorcycleId',
                                            ],
                                        }, // Verifica se o ID da moto coincide
                                        {
                                            $eq: ['$status', RentStatus.RENTED],
                                        }, // Filtra por aluguéis no estado RENTED
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'currentRentals', // Armazena o resultado da junção em 'currentRentals'
                },
            },
            {
                // Filtra motos que não têm aluguéis ativos (verifica se o array de aluguéis ativos está vazio)
                $match: { currentRentals: { $size: 0 } },
            },
            {
                // Limita os resultados a apenas um documento
                $limit: 1,
            },
        ]).exec()
    }
}
