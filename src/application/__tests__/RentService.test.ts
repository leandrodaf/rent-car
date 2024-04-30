import { RentService } from '../RentService'
import { IDelivererService } from '../interfaces/IDelivererService'
import { IRentPlanRepository } from '../interfaces/IRentPlanRepository'
import { IRentRepository } from '../interfaces/IRentRepository'
import { DriverLicenseType, IDelivererModel } from '../../domain/Deliverer'
import { IRent, IRentModel, RentStatus } from '../../domain/Rent'
import { CustomError } from '../../utils/handdlers/CustomError'
import { StatusCodes } from 'http-status-codes'
import { DateTime } from 'luxon'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'
import { IMessage } from '../../infrastructure/message/IMessage'
import { IMotorcycleService } from '../interfaces/IMotorcycleService'

const mockDelivererService: jest.Mocked<IDelivererService> = {
    findById: jest.fn(),
    registerDeliverer: jest.fn(),
    paginate: jest.fn(),
    attachDocument: jest.fn(),
}

const mockRentPlanRepository: jest.Mocked<IRentPlanRepository> = {
    findBy: jest.fn(),
}

const mockRentRepository: jest.Mocked<IRentRepository> = {
    create: jest.fn(),
    filter: jest.fn(),
    findRentedByPlate: jest.fn(),
    update: jest.fn(),
    findRentsByMotorcyclePlate: jest.fn(),
}

const mockMotorcycleService: jest.Mocked<IMotorcycleService> = {
    create: jest.fn(),
    paginate: jest.fn(),
    updateBy: jest.fn(),
    delete: jest.fn(),
    getAvailability: jest.fn(),
}

const mockMessage: jest.Mocked<IMessage> = {
    sendMessage: jest.fn(),
    consumeMessage: jest.fn(),
}

describe('RentService', () => {
    let service: RentService
    let originalNow: any

    const deliverer = {
        _id: '1',

        driverLicenseType: DriverLicenseType.A,
    } as unknown as IDelivererModel

    beforeAll(() => {
        originalNow = DateTime.now
        DateTime.now = () => DateTime.fromISO('2024-04-30T00:00:00.000Z') as any
    })

    afterAll(() => {
        DateTime.now = originalNow
    })

    beforeEach(() => {
        jest.clearAllMocks()
        service = new RentService(
            mockRentRepository,
            mockDelivererService,
            mockRentPlanRepository,
            mockMotorcycleService,
            mockMessage
        )
    })

    describe('renting', () => {
        it('should throw an error if no rental plan is available for the specified date range', async () => {
            const endDate = new Date('2025-05-15')

            const authorizedDeliverer = {
                _id: '1',
                driverLicenseType: DriverLicenseType.A,
            } as IDelivererModel

            mockDelivererService.findById.mockResolvedValue(authorizedDeliverer)
            mockRentPlanRepository.findBy.mockReturnValue(undefined)

            await expect(service.renting('1', endDate)).rejects.toThrow(
                new CustomError(
                    'No rental plan available for the specified range dates.',
                    StatusCodes.BAD_REQUEST
                )
            )

            expect(mockRentRepository.create).not.toHaveBeenCalled()
        })

        it('should throw an error if the deliverer is not authorized to rent a motorcycle', async () => {
            const startDate = new Date('2024-05-01')
            const endDate = new Date('2024-05-08')

            const unauthorizedDeliverer = {
                _id: '2',
                driverLicenseType: DriverLicenseType.B,
            } as IDelivererModel

            mockDelivererService.findById.mockResolvedValue(
                unauthorizedDeliverer
            )

            await expect(service.renting('2', endDate)).rejects.toThrow(
                new CustomError(
                    'Deliverer is not authorized to rent a motorcycle.',
                    StatusCodes.BAD_REQUEST
                )
            )

            expect(mockRentRepository.create).not.toHaveBeenCalled()
        })

        it('should throw an error if the date range is invalid', async () => {
            const startDate = new Date('2024-04-29')
            const endDate = new Date('2024-05-05')

            mockDelivererService.findById.mockResolvedValue(deliverer)

            await expect(service.renting('1', endDate)).rejects.toThrow(
                new CustomError(
                    'No rental plan available for the specified range dates.',
                    StatusCodes.BAD_REQUEST
                )
            )
        })

        it('should select the correct rental plan based on the date range', async () => {
            const startDate = new Date('2024-05-01')
            const endDate = new Date('2024-05-08') // 7 days
            const expectedRent = {
                deliverer,
                startDate,
                endDate,
                deliveryForecastDate: endDate,
                totalCost: 21000, // 3000 * 7 days
                status: RentStatus.PROCESSING,
                plan: {
                    days: 7,
                    dailyRate: 3000,
                },
                toJSON: () => null,
            } as unknown as IRentModel

            mockDelivererService.findById.mockResolvedValue(deliverer)
            mockRentPlanRepository.findBy.mockReturnValue({
                days: 7,
                dailyRate: 3000,
            })
            mockRentRepository.create.mockResolvedValue(expectedRent)

            const result = await service.renting('1', endDate)

            expect(mockRentPlanRepository.findBy).toHaveBeenCalledWith(8)
            expect(mockRentRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    plan: { dailyRate: 3000, days: 7 },
                })
            )
            expect(result).toEqual(expectedRent)

            expect(mockMessage.sendMessage).toHaveBeenCalledWith(
                'rent-create',
                [{ value: JSON.stringify(expectedRent) }]
            )
        })
    })

    describe('paginate', () => {
        it('should call the repository to paginate rents and return the results', async () => {
            const mockRents = [
                {
                    id: '123',
                    delivererId: '456',
                    startDate: new Date('2024-04-30'),
                    endDate: new Date('2024-05-10'),
                    plan: { days: 10, dailyRate: 2000 },
                    status: RentStatus.PROCESSING,
                    totalCost: 20000,
                    deliveryForecastDate: new Date('2024-05-10'),
                } as unknown as IRentModel,
            ]

            const search = {
                filters: { delivererId: '456' },
                paginate: { page: 1, perPage: 10 },
            } as FilterQuery<Partial<IRent>>
            const delivererId = '1234'

            mockRentRepository.filter.mockResolvedValue(mockRents)

            const result = await service.paginate(delivererId, search)

            expect(mockRentRepository.filter).toHaveBeenCalledWith(
                delivererId,
                search.filters,
                search.paginate
            )
            expect(result).toEqual(mockRents)
        })

        it('should return an empty array if no rents are found', async () => {
            const search = {
                filters: { status: 'foo-status' },
                paginate: { page: 1, perPage: 10 },
            } as unknown as FilterQuery<Partial<IRent>>
            const delivererId = '1234'

            mockRentRepository.filter.mockResolvedValue([])

            const result = await service.paginate(delivererId, search)

            expect(mockRentRepository.filter).toHaveBeenCalledWith(
                delivererId,
                search.filters,
                search.paginate
            )
            expect(result).toEqual([])
        })

        it('should handle errors from the repository', async () => {
            const search = {
                filters: { delivererId: '456' },
                paginate: { page: 1, perPage: 10 },
            } as FilterQuery<Partial<IRent>>
            const delivererId = '1234'
            const error = new Error('Database error')

            mockRentRepository.filter.mockRejectedValue(error)

            await expect(service.paginate(delivererId, search)).rejects.toThrow(
                error
            )
        })
    })

    describe('processRentalCreated', () => {
        it('should successfully assign a motorcycle and update rental to RENTED', async () => {
            const rental = {
                _id: 'rental1',
                status: RentStatus.PROCESSING,
                toJSON: () => ({ _id: 'rental1', status: RentStatus.RENTED }),
            } as unknown as IRentModel

            const motorcycle = {
                _id: 'motorcycle1',
            }

            mockMotorcycleService.getAvailability = jest
                .fn()
                .mockResolvedValue(motorcycle)
            mockRentRepository.update = jest.fn().mockResolvedValue({
                ...rental,
                motorcycle,
                status: RentStatus.RENTED,
            })

            await service.processRentCreated(JSON.stringify(rental))

            expect(mockMotorcycleService.getAvailability).toHaveBeenCalled()
            expect(mockRentRepository.update).toHaveBeenCalledWith('rental1', {
                motorcycle,
                status: RentStatus.RENTED,
            })
            expect(mockMessage.sendMessage).toHaveBeenCalledWith(
                'rental-updated',
                [
                    {
                        value: JSON.stringify({
                            _id: 'rental1',
                            status: RentStatus.RENTED,
                        }),
                    },
                ]
            )
        })

        it('should fail to assign a motorcycle and update rental to REJECTED', async () => {
            const rental = {
                _id: 'rental1',
                status: RentStatus.PROCESSING,
                toJSON: () => ({ _id: 'rental1', status: RentStatus.REJECTED }),
            } as unknown as IRentModel

            mockMotorcycleService.getAvailability = jest
                .fn()
                .mockRejectedValue(new Error('No available motorcycles'))
            mockRentRepository.update = jest.fn().mockResolvedValue({
                ...rental,
                status: RentStatus.REJECTED,
            })

            await service.processRentCreated(JSON.stringify(rental))

            expect(mockMotorcycleService.getAvailability).toHaveBeenCalled()
            expect(mockRentRepository.update).toHaveBeenCalledWith('rental1', {
                status: RentStatus.REJECTED,
            })
            expect(mockMessage.sendMessage).toHaveBeenCalledWith(
                'rental-updated',
                [
                    {
                        value: JSON.stringify({
                            _id: 'rental1',
                            status: RentStatus.REJECTED,
                        }),
                    },
                ]
            )
        })

        it('should log an error if updating the rental fails', async () => {
            const rental = {
                _id: 'rental1',
                status: RentStatus.PROCESSING,
                toJSON: () => ({
                    _id: 'rental1',
                    status: RentStatus.PROCESSING,
                }),
            } as unknown as IRentModel

            mockMotorcycleService.getAvailability = jest
                .fn()
                .mockResolvedValue({})
            mockRentRepository.update = jest
                .fn()
                .mockRejectedValue(new Error('Update failed'))

            await expect(
                service.processRentCreated(JSON.stringify(rental))
            ).rejects.toThrow('Update failed')

            expect(mockMotorcycleService.getAvailability).toHaveBeenCalled()
        })
    })
})
