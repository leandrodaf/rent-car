import {
    DriverLicenseType,
    IDeliverer,
    IDelivererModel,
} from '../../domain/Deliverer'
import { UserType } from '../../domain/User'
import { DelivererService } from '../DelivererService'
import { IDelivererRepository } from '../interfaces/IDelivererRepository'

const mockDelivererRepository: IDelivererRepository = {
    create: jest.fn(),
}

describe('DelivererService', () => {
    let service: DelivererService

    beforeEach(() => {
        jest.clearAllMocks()

        service = new DelivererService(mockDelivererRepository)
    })

    describe('create', () => {
        let testDeliverer: IDeliverer

        beforeEach(() => {
            jest.clearAllMocks()

            service = new DelivererService(mockDelivererRepository)

            testDeliverer = {
                name: 'foo',
                driverLicenseImageURL: 'http://example.com/license.jpg',
                password: 'securePassword123',
                email: 'test@example.com',
                cnpj: '12345678901234',
                birthDate: '1980-01-01',
                driverLicenseNumber: 'D1234567',
                driverLicenseType: DriverLicenseType.A,
                userType: UserType.ADMIN,
            }
        })
        it('should call the create method on the deliverer repository with the correct deliverer data', async () => {
            const expectedDelivererModel = {
                ...testDeliverer,
                _id: '1',
            } as IDelivererModel

            mockDelivererRepository.create = jest
                .fn()
                .mockResolvedValue(expectedDelivererModel)

            const result = await service.registerDeliverer(testDeliverer)

            expect(mockDelivererRepository.create).toHaveBeenCalledWith(
                testDeliverer
            )

            expect(result).toBe(expectedDelivererModel)
        })
    })
})
