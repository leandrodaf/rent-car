import { MotorcycleController } from '../MotorcycleController'
import { createMockReqRes } from '../../../utils/tests/testHelpers'
import { ZodError } from 'zod'
import { UserType } from '../../../domain/User'
import { IMotorcycleService } from '../../../application/interfaces/IMotorcycleService'
import { IMotorcycle, IMotorcycleModel } from '../../../domain/Motorcycle'

describe('MotorcycleController', () => {
    let controller: MotorcycleController
    let mockMotorcycleService: jest.Mocked<IMotorcycleService>
    let motorcycleData: IMotorcycle

    beforeEach(() => {
        mockMotorcycleService = {
            create: jest.fn(),
        }

        motorcycleData = {
            plate: 'XYZ1A21',
            year: 1990,
            modelName: 'Teste',
        }

        controller = new MotorcycleController(mockMotorcycleService)
    })

    describe('store', () => {
        it('should create a motorcycle successfully and return the appropriate response', async () => {
            const body = {
                ...motorcycleData,
            }

            const { req, res, next } = createMockReqRes({
                body,
                auth: {
                    userType: UserType.ADMIN,
                },
            })

            mockMotorcycleService.create.mockResolvedValue({
                ...motorcycleData,
                _id: 'foo-id',
            } as unknown as IMotorcycleModel)

            await controller.store(req, res, next)

            expect(mockMotorcycleService.create).toHaveBeenCalledWith(body)
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                data: {
                    ...motorcycleData,
                },
            })
        })

        it('should handle errors if create a motorcycle fails due to service layer failure', async () => {
            const { req, res, next } = createMockReqRes({
                body: { plate: 1234 },
                auth: {
                    userType: UserType.ADMIN,
                },
            })

            const error = new Error('Service failure')
            mockMotorcycleService.create.mockRejectedValue(error)

            await controller.store(req, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(ZodError))
        })
    })
})
