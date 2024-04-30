import { MotorcycleService } from '../MotorcycleService'
import { IMotorcycleRepository } from '../interfaces/IMotorcycleRepository'
import { IMotorcycle, IMotorcycleModel } from '../../domain/Motorcycle'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'
import { CustomError } from '../../utils/handdlers/CustomError'
import { StatusCodes } from 'http-status-codes'
import { IRentRepository } from '../interfaces/IRentRepository'

const motorcycleRepository: IMotorcycleRepository = {
    create: jest.fn(),
    filter: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    firstAvailable: jest.fn(),
}

const rentRepositoryRepository: IRentRepository = {
    create: jest.fn(),
    filter: jest.fn(),
    findRentedByPlate: jest.fn(),
    update: jest.fn(),
    findRentsByMotorcyclePlate: jest.fn(),
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
        service = new MotorcycleService(
            motorcycleRepository,
            rentRepositoryRepository
        )
    })

    describe('create', () => {
        it('should call the create method on the deliverer repository with the correct deliverer data', async () => {
            const expectedMotorcycleModel = {
                ...testMotorcycle,
                _id: '1',
            } as IMotorcycleModel

            motorcycleRepository.create = jest
                .fn()
                .mockResolvedValue(expectedMotorcycleModel)

            const result = await service.create(testMotorcycle)

            expect(motorcycleRepository.create).toHaveBeenCalledWith(
                testMotorcycle
            )

            expect(result).toBe(expectedMotorcycleModel)
        })
    })

    describe('paginate', () => {
        it('must call the repository and return an empty list', async () => {
            const mockResponse: IMotorcycleModel[] = []

            motorcycleRepository.filter = jest
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

            expect(motorcycleRepository.filter).toHaveBeenCalledWith(
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

            motorcycleRepository.filter = jest
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

            expect(motorcycleRepository.filter).toHaveBeenCalledWith(
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

            motorcycleRepository.update = jest
                .fn()
                .mockResolvedValue(updatedMotorcycle)

            const result = await service.updateBy(searchCriteria, newData)

            expect(motorcycleRepository.update).toHaveBeenCalledWith(
                searchCriteria,
                newData
            )
            expect(result).toEqual(updatedMotorcycle)
        })

        it('should throw a CustomError with status 404 when no motorcycle is found', async () => {
            const searchCriteria = { plate: 'non-existent-plate' }
            const newData = { year: 2025 }

            motorcycleRepository.update = jest.fn().mockResolvedValue(null)

            await expect(
                service.updateBy(searchCriteria, newData)
            ).rejects.toThrow(
                new CustomError('Motorcycle not found', StatusCodes.NOT_FOUND)
            )
        })
    })

    describe('delete', () => {
        it('should not delete the motorcycle if there are active rents associated', async () => {
            const searchCriteria = { plate: 'example-plate' }
            const activeRents = [{ _id: 'rent1', status: 'RENTED' }]

            rentRepositoryRepository.findRentsByMotorcyclePlate = jest
                .fn()
                .mockResolvedValue(activeRents)

            await expect(service.delete(searchCriteria)).rejects.toThrow(
                new CustomError(
                    'Cannot delete motorcycle with rents',
                    StatusCodes.BAD_REQUEST
                )
            )

            expect(
                rentRepositoryRepository.findRentsByMotorcyclePlate
            ).toHaveBeenCalledWith('example-plate')
            expect(motorcycleRepository.delete).not.toHaveBeenCalled()
        })

        it('should delete the motorcycle and return the deleted model when no active rents are found', async () => {
            const searchCriteria = { plate: 'example-plate' }
            const expectedMotorcycleModel = {
                ...testMotorcycle,
                _id: '1',
            } as IMotorcycleModel

            rentRepositoryRepository.findRentsByMotorcyclePlate = jest
                .fn()
                .mockResolvedValue([])
            motorcycleRepository.delete = jest
                .fn()
                .mockResolvedValue(expectedMotorcycleModel)

            const result = await service.delete(searchCriteria)

            expect(
                rentRepositoryRepository.findRentsByMotorcyclePlate
            ).toHaveBeenCalledWith('example-plate')
            expect(motorcycleRepository.delete).toHaveBeenCalledWith(
                searchCriteria
            )
            expect(result).toEqual(expectedMotorcycleModel)
        })

        it('should throw a CustomError with status 404 when the motorcycle is not found', async () => {
            const searchCriteria = { plate: 'non-existent-plate' }

            rentRepositoryRepository.findRentsByMotorcyclePlate = jest
                .fn()
                .mockResolvedValue([])
            motorcycleRepository.delete = jest.fn().mockResolvedValue(null)

            await expect(service.delete(searchCriteria)).rejects.toThrow(
                new CustomError('Motorcycle not found', StatusCodes.NOT_FOUND)
            )

            expect(
                rentRepositoryRepository.findRentsByMotorcyclePlate
            ).toHaveBeenCalledWith('non-existent-plate')
            expect(motorcycleRepository.delete).toHaveBeenCalledWith(
                searchCriteria
            )
        })
    })

    describe('getAvailability', () => {
        it('should return the first available motorcycle when one is available', async () => {
            const availableMotorcycles = [
                {
                    _id: 'motorcycle1',
                    plate: 'XYZ-7890',
                    year: 2021,
                    modelName: 'Model Y',
                } as IMotorcycleModel,
            ]

            motorcycleRepository.firstAvailable = jest
                .fn()
                .mockResolvedValue(availableMotorcycles)

            const result = await service.getAvailability()

            expect(motorcycleRepository.firstAvailable).toHaveBeenCalled()
            expect(result).toEqual(availableMotorcycles[0])
        })

        it('should throw a CustomError with status 404 when no motorcycles are available', async () => {
            motorcycleRepository.firstAvailable = jest
                .fn()
                .mockResolvedValue([])

            await expect(service.getAvailability()).rejects.toThrow(
                new CustomError(
                    'No motorcycles available in stock',
                    StatusCodes.NOT_FOUND
                )
            )
        })
    })
})
