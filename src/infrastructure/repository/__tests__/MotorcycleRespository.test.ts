import { MotorcycleRepository } from '../MotorcycleRepository'
import {
    IMotorcycle,
    IMotorcycleModel,
    Motorcycle,
} from '../../../domain/Motorcycle'
import { IMotorcycleRepository } from '../../../application/interfaces/IMotorcycleRepository'
import { buildPaginate } from '../Paginate'

jest.mock('../../../domain/Motorcycle')

jest.mock('../Paginate', () => ({
    buildPaginate: jest.fn((paginate, query) => query),
}))

describe('MotorcycleRepository', () => {
    let motorcycleRepository: IMotorcycleRepository

    beforeEach(() => {
        jest.clearAllMocks()
        motorcycleRepository = new MotorcycleRepository()
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

    describe('update', () => {
        it('Must update using mongoose apis with update', async () => {
            const exec = jest.fn().mockResolvedValue([])

            Motorcycle.findOneAndUpdate = jest
                .fn()
                .mockImplementation(() => ({ exec }))

            const search = { plate: 'foo-id' }
            const data: Partial<IMotorcycle> = { plate: 'foo bar' }

            await motorcycleRepository.update(search, data)

            expect(Motorcycle.findOneAndUpdate).toHaveBeenCalledWith(
                search,
                data
            )
        })
    })

    describe('delete', () => {
        it('should delete the motorcycle and return the deleted motorcycle model when found', async () => {
            const expectedMotorcycleModel = {
                plate: 'example-plate',
                year: 2024,
                modelName: 'foo',
                _id: '1',
            } as IMotorcycleModel

            Motorcycle.findOneAndDelete = jest
                .fn()
                .mockResolvedValue(expectedMotorcycleModel)

            const searchCriteria = { plate: 'example-plate' }

            const result = await motorcycleRepository.delete(searchCriteria)

            expect(Motorcycle.findOneAndDelete).toHaveBeenCalledWith(
                searchCriteria
            )
            expect(result).toEqual(expectedMotorcycleModel)
        })

        it('should return null when no motorcycle is found', async () => {
            Motorcycle.findOneAndDelete = jest.fn().mockResolvedValue(null)

            const searchCriteria = { plate: 'non-existent-plate' }

            const result = await motorcycleRepository.delete(searchCriteria)

            expect(Motorcycle.findOneAndDelete).toHaveBeenCalledWith(
                searchCriteria
            )
            expect(result).toBeNull()
        })
    })

    describe('firstAvailable', () => {
        it('should return the first available motorcycle when one is available', async () => {
            const mockMotorcycle = [
                {
                    _id: 'motorcycle1',
                    plate: 'ABC-1234',
                    year: 2021,
                    modelName: 'Model X',
                    currentRentals: [],
                },
            ]

            Motorcycle.aggregate = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockMotorcycle),
            })

            const result = await motorcycleRepository.firstAvailable()

            expect(Motorcycle.aggregate).toHaveBeenCalled()
            expect(result).toEqual(mockMotorcycle)
        })

        it('should return null or an empty array when no motorcycles are available', async () => {
            Motorcycle.aggregate = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            })

            const result = await motorcycleRepository.firstAvailable()

            expect(Motorcycle.aggregate).toHaveBeenCalled()
            expect(result).toEqual([])
        })
    })
})
