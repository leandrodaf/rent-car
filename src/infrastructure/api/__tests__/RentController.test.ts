import { RentController } from '../RentController'
import { createMockReqRes } from '../../../utils/tests/testHelpers'
import { IRentService } from '../../../application/interfaces/IRentService'
import { UserType } from '../../../domain/User'
import { RentResource } from '../resources/RentResource'
import { IRentModel } from '../../../domain/Rent'
import {
    IRentBudgetService,
    PriceCalculated,
} from '../../../application/interfaces/IRentBudgetService'
import { ZodError } from 'zod'

describe('RentController', () => {
    let controller: RentController
    let mockRentService: jest.Mocked<IRentService>
    let mockRentBudgetService: jest.Mocked<IRentBudgetService>

    beforeEach(() => {
        jest.resetAllMocks()

        mockRentService = {
            renting: jest.fn(),
            paginate: jest.fn(),
            processRentCreated: jest.fn(),
        }

        mockRentBudgetService = {
            expectedReturn: jest.fn(),
            finalizeRent: jest.fn(),
        }

        controller = new RentController(mockRentService, mockRentBudgetService)
    })

    describe('rent', () => {
        it('should successfully create a rental and return the appropriate response', async () => {
            const body = {
                startDate: '2024-04-30',
                endDate: '2024-05-01',
            }

            const { req, res, next } = createMockReqRes({
                body,
                auth: { _id: 'user-id', userType: UserType.DELIVERER },
            })

            await controller.rent(req, res, next)

            expect(mockRentService.renting).toHaveBeenCalledWith(
                'user-id',
                new Date('2024-05-01T03:00:00.000Z')
            )
            expect(res.status).toHaveBeenCalledWith(202)
            expect(res.send).toHaveBeenCalled()
        })

        it('should handle errors if request validation fails', async () => {
            const { req, res, next } = createMockReqRes({
                body: {
                    endDate: 'invalid-date',
                },
                auth: { _id: 'user-id', userType: UserType.DELIVERER },
            })

            await controller.rent(req, res, next)

            expect(next).toHaveBeenCalled()
        })
    })

    describe('paginate', () => {
        it('should successfully fetch paginated results and return them', async () => {
            const mockRentData = [
                {
                    id: 'rent-id',
                    endDate: new Date('2024-05-01T03:00:00.000Z'),
                    delivererId: 'user-id',
                } as unknown as IRentModel,
            ]

            const { req, res, next } = createMockReqRes({
                query: {
                    page: '1',
                    perPage: '10',
                },
                auth: {
                    _id: 'user-id',
                    userType: UserType.DELIVERER,
                },
            })

            mockRentService.paginate.mockResolvedValue(mockRentData)

            await controller.paginate(req, res, next)

            expect(mockRentService.paginate).toHaveBeenCalledWith('user-id', {
                filters: {},
                paginate: { page: 1, perPage: 10 },
            })
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                data: mockRentData.map((item) => new RentResource(item)),
                paginate: { page: 1, perPage: 10 },
            })
        })

        it('should handle errors if pagination fails', async () => {
            const { req, res, next } = createMockReqRes({
                query: {
                    page: '1',
                    perPage: '10',
                },
                auth: {
                    _id: 'user-id',
                    userType: UserType.DELIVERER,
                },
            })

            const error = new Error('Pagination failure')
            mockRentService.paginate.mockRejectedValue(error)

            await controller.paginate(req, res, next)

            expect(next).toHaveBeenCalledWith(error)
        })
    })

    describe('expectedReturn', () => {
        it('should successfully calculate expected return price and return the appropriate response', async () => {
            const body = {
                plate: 'XYZ1A21',
                deliveryDate: '2024-05-01',
            }

            const expectedPriceData = {
                totalCost: 20000,
                totalDaysUsed: 10,
                rent: {
                    plan: {},
                    startDate: new Date('2024-04-29'),
                    endDate: new Date('2024-04-29'),
                },
            } as PriceCalculated

            const { req, res, next } = createMockReqRes({
                body,
                auth: { _id: 'user-id', userType: UserType.DELIVERER },
            })

            mockRentBudgetService.expectedReturn.mockResolvedValue(
                expectedPriceData
            )

            await controller.expectedReturn(req, res, next)

            expect(mockRentBudgetService.expectedReturn).toHaveBeenCalledWith(
                'user-id',
                'XYZ1A21',
                new Date('2024-05-01T03:00:00.000Z')
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                data: {
                    deliveryDate: new Date('2024-05-01T03:00:00.000Z'),
                    endDate: new Date('2024-04-29T00:00:00.000Z'),
                    plan: {},
                    startDate: new Date('2024-04-29T00:00:00.000Z'),
                    totalCost: 20000,
                    totalDaysUsed: 10,
                },
            })
        })

        it('should handle errors if request validation fails', async () => {
            const { req, res, next } = createMockReqRes({
                body: {
                    deliveryDate: 'invalid-date',
                },
                auth: { _id: 'user-id', userType: UserType.DELIVERER },
            })

            await controller.expectedReturn(req, res, next)

            expect(next).toHaveBeenCalled()
        })

        it('should handle errors if expected return calculation fails', async () => {
            const body = {
                plate: 'ABC1234',
                deliveryDate: '2024-05-01',
            }

            const { req, res, next } = createMockReqRes({
                body,
                auth: { _id: 'user-id', userType: UserType.DELIVERER },
            })

            const error = new Error('Calculation failure')
            mockRentBudgetService.expectedReturn.mockRejectedValue(error)

            await controller.expectedReturn(req, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(ZodError))
        })
    })

    describe('finalizeRent', () => {
        it('should successfully finalize the rent and respond correctly', async () => {
            const body = {
                plate: 'XYZ1A21',
                deliveryDate: '2024-05-01',
            }

            const { req, res, next } = createMockReqRes({
                body,
                auth: { _id: 'user-id', userType: UserType.DELIVERER },
            })

            mockRentBudgetService.finalizeRent.mockResolvedValue(
                {} as IRentModel
            )

            await controller.finalizeRent(req, res, next)

            expect(mockRentBudgetService.finalizeRent).toHaveBeenCalledWith(
                'user-id',
                'XYZ1A21',
                new Date('2024-05-01T03:00:00.000Z')
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.send).toHaveBeenCalled()
        })

        it('should handle errors if request validation fails', async () => {
            const { req, res, next } = createMockReqRes({
                body: {
                    plate: 'XYZ1A21',
                    deliveryDate: 'invalid-date',
                },
                auth: { _id: 'user-id', userType: UserType.DELIVERER },
            })

            await controller.finalizeRent(req, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(Error))
        })

        it('should handle errors if rent finalization fails', async () => {
            const body = {
                plate: 'XYZ1A21',
                deliveryDate: '2024-05-01',
            }

            const { req, res, next } = createMockReqRes({
                body,
                auth: { _id: 'user-id', userType: UserType.DELIVERER },
            })

            const error = new Error('Finalization failure')
            mockRentBudgetService.finalizeRent.mockRejectedValue(error)

            await controller.finalizeRent(req, res, next)

            expect(mockRentBudgetService.finalizeRent).toHaveBeenCalledWith(
                'user-id',
                'XYZ1A21',
                new Date('2024-05-01T03:00:00.000Z')
            )
            expect(next).toHaveBeenCalledWith(error)
        })
    })
})
