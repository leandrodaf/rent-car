import { IRent, IRentModel, Rent, RentStatus } from '../../../domain/Rent'
import { RentRepository } from '../RentRepository'
import { buildPaginate } from '../Paginate'

jest.mock('../../../domain/Rent')

jest.mock('../Paginate', () => ({
    buildPaginate: jest.fn((paginate, query) => query),
}))

describe('RentRepository', () => {
    let rentRepository: RentRepository

    beforeEach(() => {
        jest.clearAllMocks()
        rentRepository = new RentRepository()
    })

    describe('create', () => {
        it('should successfully create a new rent record', async () => {
            const mockRentData = {} as IRent

            const mockRentModel = {
                ...mockRentData,
                _id: '789',
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
            } as unknown as IRentModel

            Rent.create = jest.fn().mockResolvedValue(mockRentModel)

            const result = await rentRepository.create(mockRentData)

            expect(Rent.create).toHaveBeenCalledWith(mockRentData)
            expect(result).toEqual(mockRentModel)
        })

        it('should handle errors when creating a new rent record', async () => {
            const mockRentData = {} as IRent

            const error = new Error('Database error')
            Rent.create = jest.fn().mockRejectedValue(error)

            await expect(rentRepository.create(mockRentData)).rejects.toThrow(
                error
            )

            expect(Rent.create).toHaveBeenCalledWith(mockRentData)
        })
    })

    describe('filter', () => {
        it('must filter using mongoose APIs with pagination', async () => {
            const filters = { delivererId: '123' } as Partial<IRent>
            const paginate = { page: 1, perPage: 10 }
            const delivererId = '123'

            const execMock = jest.fn().mockResolvedValue([])

            Rent.find = jest.fn().mockImplementation(() => ({
                exec: execMock,
            }))

            await rentRepository.filter(delivererId, filters, paginate)

            expect(buildPaginate).toHaveBeenCalledWith(
                paginate,
                expect.anything()
            )
            expect(Rent.find).toHaveBeenCalledWith({
                ...filters,
                deliverer: delivererId,
            })
            expect(execMock).toHaveBeenCalled()
        })

        it('should handle empty filters correctly', async () => {
            const filters = null
            const paginate = { page: 2, perPage: 5 }
            const delivererId = '123'

            const execMock = jest.fn().mockResolvedValue([])

            Rent.find = jest.fn().mockImplementation(() => ({
                exec: execMock,
            }))

            await rentRepository.filter(delivererId, filters, paginate)

            expect(buildPaginate).toHaveBeenCalledWith(
                paginate,
                expect.anything()
            )
            expect(Rent.find).toHaveBeenCalledWith({
                deliverer: delivererId,
            })
            expect(execMock).toHaveBeenCalled()
        })
    })

    describe('findRentedByPlate', () => {
        it('should find a rented record by plate and delivererId', async () => {
            const mockRentModel = {
                _id: '123',
                deliverer: 'deliverer123',
                motorcycle: {
                    plate: 'XYZ1234',
                },
                status: RentStatus.RENTED,
            } as unknown as IRentModel

            Rent.findOne = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockRentModel),
                }),
            })

            const result = await rentRepository.findRentedByPlate(
                'deliverer123',
                'XYZ1234'
            )

            expect(Rent.findOne).toHaveBeenCalledWith({
                deliverer: 'deliverer123',
                status: RentStatus.RENTED,
            })
            expect(result).toEqual(mockRentModel)
        })

        it('should return null when no rent record matches the query', async () => {
            Rent.findOne = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null),
                }),
            })

            const result = await rentRepository.findRentedByPlate(
                'deliverer999',
                'XYZ9999'
            )

            expect(Rent.findOne).toHaveBeenCalledWith({
                deliverer: 'deliverer999',
                status: RentStatus.RENTED,
            })
            expect(result).toBeNull()
        })
    })

    describe('update', () => {
        it('should successfully update a rent record and return the updated model', async () => {
            const id = '789'
            const updateData = { status: RentStatus.DONE }

            const updatedRent = {
                _id: id,
                status: RentStatus.DONE,
            } as IRentModel

            Rent.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedRent)

            const result = await rentRepository.update(id, updateData)

            expect(Rent.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData)
            expect(result).toEqual(updatedRent)
        })

        it('should return null if the rent record does not exist', async () => {
            const id = '790'
            const updateData = { status: RentStatus.DONE }

            Rent.findByIdAndUpdate = jest.fn().mockResolvedValue(null)

            const result = await rentRepository.update(id, updateData)

            expect(Rent.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData)
            expect(result).toBeNull()
        })
    })

    describe('findRentsByMotorcyclePlate', () => {
        it('should return rents that match the given motorcycle plate', async () => {
            const plate = 'ABC123'
            const mockRents = [
                {
                    _id: '123',
                    motorcycle: {
                        _id: 'm123',
                        plate: 'ABC123',
                    },
                    status: RentStatus.RENTED,
                },
            ]

            Rent.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockRents),
                }),
            })

            const result =
                await rentRepository.findRentsByMotorcyclePlate(plate)

            expect(Rent.find).toHaveBeenCalled()
            expect(result).toEqual(mockRents)
        })

        it('should return an empty array when no rents match the given motorcycle plate', async () => {
            const plate = 'XYZ789'
            Rent.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue([]),
                }),
            })

            const result =
                await rentRepository.findRentsByMotorcyclePlate(plate)

            expect(Rent.find).toHaveBeenCalled()
            expect(result).toEqual([])
        })
    })
})
