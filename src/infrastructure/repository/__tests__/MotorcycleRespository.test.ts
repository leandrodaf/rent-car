import { IDelivererRepository } from '../../../application/interfaces/IDelivererRepository'
import {
    Deliverer,
    DriverLicenseType,
    IDeliverer,
    IDelivererModel,
} from '../../../domain/Deliverer'
import { UserType } from '../../../domain/User'
import { DelivererRepository } from '../DelivererRepository'
import { buildPaginate } from '../Paginate'

jest.mock('../../../domain/Deliverer')

jest.mock('../Paginate', () => ({
    buildPaginate: jest.fn((paginate, query) => query),
}))

describe('MotorcycleRespository', () => {
    let delivererRepository: IDelivererRepository

    beforeEach(() => {
        jest.clearAllMocks()
        delivererRepository = new DelivererRepository()
    })

    describe('create', () => {
        it('should return a user when findByEmail is called with an existing email', async () => {
            const mockDeliverer = {} as IDelivererModel

            Deliverer.create = jest.fn().mockResolvedValue(mockDeliverer)

            const data = {
                name: 'foo',
                driverLicenseImageURL: 'http://example.com/license.jpg',
                password: 'securePassword123',
                email: 'test@example.com',
                cnpj: '12345678901234',
                birthDate: '1980-01-01',
                driverLicenseNumber: 'D1234567',
                driverLicenseType: DriverLicenseType.A,
                userType: UserType.ADMIN,
            } as IDeliverer

            const result = await delivererRepository.create(data)

            expect(Deliverer.create).toHaveBeenCalledWith(data)
            expect(result).toEqual(mockDeliverer)
        })
    })

    describe('filter', () => {
        it('Must filter using mongoose apis with pagination', async () => {
            const filters = null
            const paginate = { page: 1, perPage: 10 }

            const exec = jest.fn().mockResolvedValue([])

            Deliverer.find = jest.fn().mockImplementation(() => ({ exec }))

            await delivererRepository.filter(filters, paginate)

            expect(buildPaginate).toHaveBeenCalledWith(
                paginate,
                expect.anything()
            )
            expect(Deliverer.find).toHaveBeenCalledWith({})
            expect(exec).toHaveBeenCalled()
        })
    })

    describe('findById', () => {
        it('Must filter using mongoose apis with findById', async () => {
            Deliverer.findById = jest.fn()

            const id = 'foo-id'

            await delivererRepository.findById(id)

            expect(Deliverer.findById).toHaveBeenCalledWith(id)
        })
    })

    describe('update', () => {
        it('Must update using mongoose apis with update', async () => {
            const exec = jest.fn().mockResolvedValue([])

            Deliverer.findOneAndUpdate = jest
                .fn()
                .mockImplementation(() => ({ exec }))

            const id = 'foo-id'
            const data: Partial<IDeliverer> = { name: 'foo bar' }

            await delivererRepository.update(id, data)

            expect(Deliverer.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: id },
                data,
                { new: true, runValidators: true }
            )
        })
    })
})
