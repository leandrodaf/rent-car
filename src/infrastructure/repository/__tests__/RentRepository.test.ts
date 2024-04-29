import { IRent, IRentModel, Rent } from '../../../domain/Rent'
import { RentRepository } from '../RentRepository'

jest.mock('../../../domain/Rent')

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
})
