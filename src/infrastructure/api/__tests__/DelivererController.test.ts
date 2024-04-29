import { DelivererController } from '../DelivererController'
import { createMockReqRes } from '../../../utils/tests/testHelpers'
import { IDelivererService } from '../../../application/interfaces/IDelivererService'
import { IDelivererModel } from '../../../domain/Deliverer'
import { ZodError } from 'zod'

describe('DelivererController', () => {
    let controller: DelivererController
    let mockDelivererService: jest.Mocked<IDelivererService>

    beforeEach(() => {
        mockDelivererService = {
            registerDeliverer: jest.fn(),
        }
        controller = new DelivererController(mockDelivererService)
    })

    describe('register', () => {
        it('should register a deliverer successfully and return the appropriate response', async () => {
            const delivererData = {
                email: 'user@example.com',
                password: 'userpass',
                passwordConfirmation: 'userpass',
                name: 'UserName',
                cnpj: '65426424000168',
                birthDate: '2000-01-01',
                driverLicenseNumber: '34148340222',
                driverLicenseType: 'A',
                userType: 'deliverer',
                driverLicenseImageURL: undefined,
            }

            const { req, res, next } = createMockReqRes({ body: delivererData })

            mockDelivererService.registerDeliverer.mockResolvedValue({
                ...delivererData,
                _id: 'foo-id',
            } as unknown as IDelivererModel)

            await controller.register(req, res, next)

            expect(mockDelivererService.registerDeliverer).toHaveBeenCalledWith(
                delivererData
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
})
