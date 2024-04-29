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
            paginate: jest.fn(),
            updateBy: jest.fn(),
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

    describe('paginate', () => {
        it('should successfully fetch paginated results and return them', async () => {
            const { req, res, next } = createMockReqRes({
                query: { page: '1', perPage: '10' },
                auth: {
                    userType: UserType.ADMIN,
                },
            })

            const mockPaginatedData = {
                ...motorcycleData,
            } as unknown as IMotorcycleModel

            mockMotorcycleService.paginate.mockResolvedValue([
                mockPaginatedData,
            ])

            await controller.paginate(req, res, next)

            expect(mockMotorcycleService.paginate).toHaveBeenCalledWith({
                filters: {},
                paginate: { page: 1, perPage: 10 },
            })
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                data: [mockPaginatedData],
                paginate: {
                    page: 1,
                    perPage: 10,
                },
            })
        })

        it('should handle errors if pagination fails due to service layer failure', async () => {
            const { req, res, next } = createMockReqRes({
                query: {
                    page: '1',
                    perPage: '10',
                    plate: '1',
                },
                auth: {
                    userType: UserType.ADMIN,
                },
            })

            await controller.paginate(req, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(ZodError))
        })
    })

    describe('updatePlate', () => {
        it('should successfully update the motorcycle plate and return status 200', async () => {
            const { req, res, next } = createMockReqRes({
                body: {
                    plate: 'XYZ1A21',
                },
                params: {
                    plate: 'XYZ1A22',
                },
                auth: {
                    userType: UserType.ADMIN,
                },
            })

            mockMotorcycleService.updateBy.mockResolvedValue({} as any)

            await controller.updatePlate(req, res, next)

            expect(mockMotorcycleService.updateBy).toHaveBeenCalledWith(
                { plate: 'XYZ1A22' },
                { plate: 'XYZ1A21' }
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.send).toHaveBeenCalled()
        })

        it('should handle errors if update operation fails', async () => {
            const { req, res, next } = createMockReqRes({
                auth: {
                    userType: UserType.ADMIN,
                },
            })

            await controller.updatePlate(req, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(ZodError))
        })
    })
})
