import { MotorcycleService } from '../MotorcycleService'
import { IMotorcycleRespository } from '../interfaces/IMotorcycleRespository'
import { IMotorcycle, IMotorcycleModel } from '../../domain/Motorcycle'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'

const motorcycleRespository: IMotorcycleRespository = {
    create: jest.fn(),
    filter: jest.fn(),
}

describe('MotorcycleService', () => {
    let service: MotorcycleService

    beforeEach(() => {
        jest.clearAllMocks()

        service = new MotorcycleService(motorcycleRespository)
    })

    describe('create', () => {
        let testMotorcycle: IMotorcycle

        beforeEach(() => {
            testMotorcycle = {
                plate: 'example-plate',
                year: 2024,
                modelName: 'foo',
            }
        })

        it('should call the create method on the deliverer repository with the correct deliverer data', async () => {
            const expectedMotorcycleModel = {
                ...testMotorcycle,
                _id: '1',
            } as IMotorcycleModel

            motorcycleRespository.create = jest
                .fn()
                .mockResolvedValue(expectedMotorcycleModel)

            const result = await service.create(testMotorcycle)

            expect(motorcycleRespository.create).toHaveBeenCalledWith(
                testMotorcycle
            )

            expect(result).toBe(expectedMotorcycleModel)
        })
    })

    describe('paginate', () => {
        it('must call the repository and return an empty list', async () => {
            const mockResponse: IMotorcycleModel[] = []

            motorcycleRespository.filter = jest
                .fn()
                .mockResolvedValue(mockResponse)

            const search: FilterQuery<Partial<IMotorcycle>> = {
                paginate: {
                    page: 1,
                    perPage: 10,
                },
                filters: null,
            }

            const result = await service.paginate(search)

            expect(motorcycleRespository.filter).toHaveBeenCalledWith(
                search.filters,
                search.paginate
            )

            expect(result).toEqual(mockResponse)
        })

        it('should call the repository and return one of the objects', async () => {
            const mockResponse: IMotorcycleModel[] = [
                {
                    plate: 'example-plate',
                    year: 2024,
                    modelName: 'foo',
                } as IMotorcycleModel,
            ]

            motorcycleRespository.filter = jest
                .fn()
                .mockResolvedValue(mockResponse)

            const search: FilterQuery<Partial<IMotorcycle>> = {
                paginate: {
                    page: 1,
                    perPage: 10,
                },
                filters: null,
            }

            const result = await service.paginate(search)

            expect(motorcycleRespository.filter).toHaveBeenCalledWith(
                search.filters,
                search.paginate
            )

            expect(result).toEqual(mockResponse)
        })
    })
})
