import { RentController } from '../RentController'
import { createMockReqRes } from '../../../utils/tests/testHelpers'
import { IRentService } from '../../../application/interfaces/IRentService'
import { UserType } from '../../../domain/User'
import { RentResource } from '../resources/RentResource'
import { IRentModel } from '../../../domain/Rent'

describe('RentController', () => {
    let controller: RentController
    let mockRentService: jest.Mocked<IRentService>

    beforeEach(() => {
        jest.resetAllMocks()

        mockRentService = {
            renting: jest.fn(),
            paginate: jest.fn(),
        }

        controller = new RentController(mockRentService)
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
                new Date('2024-04-30T03:00:00.000Z'),
                new Date('2024-05-01T03:00:00.000Z')
            )
            expect(res.status).toHaveBeenCalledWith(202)
            expect(res.send).toHaveBeenCalled()
        })

        it('should handle errors if request validation fails', async () => {
            const { req, res, next } = createMockReqRes({
                body: {
                    startDate: 'invalid-date',
                    endDate: '2024-05-01',
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
                    startDate: new Date('2024-04-30T03:00:00.000Z'),
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

            expect(mockRentService.paginate).toHaveBeenCalledWith({
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
})
