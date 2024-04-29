import { MotorcycleService } from '../MotorcycleService'
import { IMotorcycleRespository } from '../interfaces/IMotorcycleRespository'
import { IMotorcycle, IMotorcycleModel } from '../../domain/Motorcycle'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'
import { CustomError } from '../../utils/handdlers/CustomError'
import { StatusCodes } from 'http-status-codes'

const motorcycleRespository: IMotorcycleRespository = {
    create: jest.fn(),
    filter: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
}

describe('MotorcycleService', () => {
    let service: MotorcycleService

    const testMotorcycle: IMotorcycle = {
        plate: 'example-plate',
        year: 2024,
        modelName: 'foo',
    }

    const updatedMotorcycle: IMotorcycleModel = {
        ...testMotorcycle,
        _id: '1',
    } as IMotorcycleModel

    beforeEach(() => {
        jest.clearAllMocks()
        service = new MotorcycleService(motorcycleRespository)
    })

    describe('create', () => {
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

    describe('updateBy', () => {
        it('should update the motorcycle and return the updated model when motorcycle is found', async () => {
            const searchCriteria = { plate: 'example-plate' }
            const newData = { year: 2025 }

            motorcycleRespository.update = jest
                .fn()
                .mockResolvedValue(updatedMotorcycle)

            const result = await service.updateBy(searchCriteria, newData)

            expect(motorcycleRespository.update).toHaveBeenCalledWith(
                searchCriteria,
                newData
            )
            expect(result).toEqual(updatedMotorcycle)
        })

        it('should throw a CustomError with status 404 when no motorcycle is found', async () => {
            const searchCriteria = { plate: 'non-existent-plate' }
            const newData = { year: 2025 }

            motorcycleRespository.update = jest.fn().mockResolvedValue(null)

            await expect(
                service.updateBy(searchCriteria, newData)
            ).rejects.toThrow(
                new CustomError('Motorcycle not found', StatusCodes.NOT_FOUND)
            )
        })
    })

    describe('delete', () => {
        it('should delete the motorcycle and return the deleted motorcycle model when motorcycle is found', async () => {
            const expectedMotorcycleModel = {
                ...testMotorcycle,
                _id: '1',
            } as IMotorcycleModel

            motorcycleRespository.delete = jest
                .fn()
                .mockResolvedValue(expectedMotorcycleModel)

            const result = await service.delete({ plate: 'example-plate' })

            expect(motorcycleRespository.delete).toHaveBeenCalledWith({
                plate: 'example-plate',
            })
            expect(result).toEqual(expectedMotorcycleModel)
        })

        it('should throw a CustomError with status 404 when no motorcycle is found', async () => {
            motorcycleRespository.delete = jest.fn().mockResolvedValue(null)

            await expect(
                service.delete({ plate: 'non-existent-plate' })
            ).rejects.toThrow(
                new CustomError('Motorcycle not found', StatusCodes.NOT_FOUND)
            )
        })
    })
})
