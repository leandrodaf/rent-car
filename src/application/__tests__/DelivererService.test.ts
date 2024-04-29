import {
    DriverLicenseType,
    IDeliverer,
    IDelivererModel,
} from '../../domain/Deliverer'
import { UserType } from '../../domain/User'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'
import { DelivererService } from '../DelivererService'
import { IDelivererRepository } from '../interfaces/IDelivererRepository'

const mockDelivererRepository: IDelivererRepository = {
    create: jest.fn(),
    filter: jest.fn(),
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

    describe('paginate', () => {
        beforeEach(() => {
            jest.clearAllMocks()

            service = new DelivererService(mockDelivererRepository)
        })

        it('must call the repository and return an empty list', async () => {
            const mockResponse: IDelivererModel[] = []

            mockDelivererRepository.filter = jest
                .fn()
                .mockResolvedValue(mockResponse)

            const search: FilterQuery<Partial<IDeliverer>> = {
                paginate: {
                    page: 1,
                    perPage: 10,
                },
                filters: null,
            }

            const result = await service.paginate(search)

            expect(mockDelivererRepository.filter).toHaveBeenCalledWith(
                search.filters,
                search.paginate
            )

            expect(result).toEqual(mockResponse)
        })

        it('should call the repository and return one of the objects', async () => {
            const mockResponse: IDelivererModel[] = [
                {
                    cnpj: 'foo',
                    birthDate: '2024-01-01',
                    driverLicenseNumber: 'foo',
                    driverLicenseType: DriverLicenseType.A,
                } as IDelivererModel,
            ]

            mockDelivererRepository.filter = jest
                .fn()
                .mockResolvedValue(mockResponse)

            const search: FilterQuery<Partial<IDeliverer>> = {
                paginate: {
                    page: 1,
                    perPage: 10,
                },
                filters: null,
            }

            const result = await service.paginate(search)

            expect(mockDelivererRepository.filter).toHaveBeenCalledWith(
                search.filters,
                search.paginate
            )

            expect(result).toEqual(mockResponse)
        })
    })
})
