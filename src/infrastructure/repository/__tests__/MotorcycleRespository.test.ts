import { MotorcycleRespository } from '../MotorcycleRespository'
import {
    IMotorcycle,
    IMotorcycleModel,
    Motorcycle,
} from '../../../domain/Motorcycle'
import { IMotorcycleRespository } from '../../../application/interfaces/IMotorcycleRespository'
import { buildPaginate } from '../Paginate'

jest.mock('../../../domain/Motorcycle')

jest.mock('../Paginate', () => ({
    buildPaginate: jest.fn((paginate, query) => query),
}))

describe('MotorcycleRepository', () => {
    let motorcycleRepository: IMotorcycleRespository

    beforeEach(() => {
        jest.clearAllMocks()
        motorcycleRepository = new MotorcycleRespository()
    })

    describe('create', () => {
        it('Must call the mongoose apis to create a motorcycle', async () => {
            const mockMotorcycle = {} as IMotorcycleModel

            Motorcycle.create = jest.fn().mockResolvedValue(mockMotorcycle)

            const data = {
                plate: 'example-plate',
                year: 2024,
                modelName: 'foo',
            } as IMotorcycle

            const result = await motorcycleRepository.create(data)

            expect(Motorcycle.create).toHaveBeenCalledWith(data)
            expect(result).toEqual(mockMotorcycle)
        })
    })

    describe('filter', () => {
        it('Must filter using mongoose apis with pagination', async () => {
            const filters = null
            const paginate = { page: 1, perPage: 10 }

            const exec = jest.fn().mockResolvedValue([])

            Motorcycle.find = jest.fn().mockImplementation(() => ({ exec }))

            await motorcycleRepository.filter(filters, paginate)

            expect(buildPaginate).toHaveBeenCalledWith(
                paginate,
                expect.anything()
            )
            expect(Motorcycle.find).toHaveBeenCalledWith({})
            expect(exec).toHaveBeenCalled()
        })
    })
})
