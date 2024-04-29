import { RentController } from '../RentController'
import { createMockReqRes } from '../../../utils/tests/testHelpers'
import { IRentService } from '../../../application/interfaces/IRentService'
import { UserType } from '../../../domain/User'

describe('RentController', () => {
    let controller: RentController
    let mockRentService: jest.Mocked<IRentService>

    beforeEach(() => {
        jest.resetAllMocks()

        mockRentService = {
            renting: jest.fn(),
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
})
