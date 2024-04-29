import { IDelivererRepository } from '../../../application/interfaces/IDelivererRepository'
import {
    Deliverer,
    DriverLicenseType,
    IDeliverer,
    IDelivererModel,
} from '../../../domain/Deliverer'
import { UserType } from '../../../domain/User'
import { DelivererRepository } from '../../repository/DelivererRepository'

jest.mock('../../../domain/Deliverer')

describe('DelivererRepository', () => {
    let delivererRepository: IDelivererRepository

    beforeEach(() => {
        jest.clearAllMocks()
        delivererRepository = new DelivererRepository()
    })

    describe('findOne', () => {
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
})
