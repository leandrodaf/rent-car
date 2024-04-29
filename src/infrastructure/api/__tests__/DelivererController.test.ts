import { DelivererController } from '../DelivererController'
import { createMockReqRes } from '../../../utils/tests/testHelpers'
import { IDelivererService } from '../../../application/interfaces/IDelivererService'
import { IDelivererModel } from '../../../domain/Deliverer'
import { ZodError } from 'zod'
import { CustomError } from '../../../utils/handdlers/CustomError'
import { UserType } from '../../../domain/User'

describe('DelivererController', () => {
    let controller: DelivererController
    let mockDelivererService: jest.Mocked<IDelivererService>

    let delivererData = beforeEach(() => {
        mockDelivererService = {
            registerDeliverer: jest.fn(),
            paginate: jest.fn(),
            attachDocument: jest.fn(),
        }

        delivererData = {
            email: 'user@example.com',
            name: 'UserName',
            cnpj: '65426424000168',
            birthDate: '2000-01-01',
            driverLicenseNumber: '34148340222',
            driverLicenseType: 'A',
            userType: 'deliverer',
            driverLicenseImageURL: undefined,
        }

        controller = new DelivererController(mockDelivererService)
    })

    describe('register', () => {
        it('should register a deliverer successfully and return the appropriate response', async () => {
            const body = {
                ...delivererData,
                password: 'userpass',
                passwordConfirmation: 'userpass',
            }

            const { req, res, next } = createMockReqRes({
                body,
            })

            mockDelivererService.registerDeliverer.mockResolvedValue({
                ...delivererData,
                _id: 'foo-id',
            } as unknown as IDelivererModel)

            await controller.register(req, res, next)

            expect(mockDelivererService.registerDeliverer).toHaveBeenCalledWith(
                body
            )
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                data: {
                    ...delivererData,
                    password: undefined,
                    passwordConfirmation: undefined,
                },
            })
        })

        it('should handle errors if registration fails due to service layer failure', async () => {
            const { req, res, next } = createMockReqRes({
                body: { email: 'failuser@example.com', password: 'failpass' },
            })

            const error = new Error('Service failure')
            mockDelivererService.registerDeliverer.mockRejectedValue(error)

            await controller.register(req, res, next)

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
                ...delivererData,
            } as unknown as IDelivererModel

            mockDelivererService.paginate.mockResolvedValue([mockPaginatedData])

            await controller.paginate(req, res, next)

            expect(mockDelivererService.paginate).toHaveBeenCalledWith({
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
                    cnpj: '7367234000185',
                    driverLicenseNumber: '123456',
                },
                auth: {
                    userType: UserType.ADMIN,
                },
            })

            await controller.paginate(req, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(ZodError))
        })
    })

    describe('attachLicenseImage', () => {
        it('must call the document image association and uploading service', async () => {
            mockDelivererService.attachDocument.mockResolvedValue(
                {} as IDelivererModel
            )

            const file = Buffer.from('fake-file')
            const userId = 'foo-id'

            const { req, res, next } = createMockReqRes({
                file: {
                    buffer: file,
                } as Express.Multer.File,
                auth: {
                    _id: userId,
                    userType: UserType.DELIVERER,
                },
            })

            await controller.attachLicenseImage(req, res, next)

            expect(mockDelivererService.attachDocument).toHaveBeenCalledWith(
                userId,
                { buffer: file }
            )
        })

        it('should call the service for linking and uploading images of documents without an authenticated user', async () => {
            const file = Buffer.from('fake-file')

            const { req, res, next } = createMockReqRes({
                file: {
                    buffer: file,
                } as Express.Multer.File,
                auth: {
                    userType: UserType.DELIVERER,
                },
            })

            await controller.attachLicenseImage(req, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(CustomError))
        })

        it('must return an error when the file is not specified', async () => {
            mockDelivererService.attachDocument.mockResolvedValue(
                {} as IDelivererModel
            )

            const { req, res, next } = createMockReqRes({
                auth: {
                    userType: UserType.DELIVERER,
                },
            })

            await controller.attachLicenseImage(req, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(CustomError))
        })
    })
})
