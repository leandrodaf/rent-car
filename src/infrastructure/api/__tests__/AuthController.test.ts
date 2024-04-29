import { AuthController } from '../AuthController'
import { createMockReqRes } from '../../../utils/tests/testHelpers'
import { IAuthService } from '../../../application/interfaces/IAuthService'

describe('AuthController', () => {
    let authController: AuthController
    let mockAuthService: jest.Mocked<IAuthService>

    beforeEach(() => {
        mockAuthService = {
            authenticate: jest.fn(),
        }
        authController = new AuthController(mockAuthService)
    })

    describe('login', () => {
        it('should authenticate and return a token on successful login', async () => {
            const { req, res, next } = createMockReqRes({
                body: { email: 'user@example.com', password: 'userpass' },
            })

            mockAuthService.authenticate.mockResolvedValue('mockToken123')

            await authController.login(req, res, next)

            expect(mockAuthService.authenticate).toHaveBeenCalledWith(
                'user@example.com',
                'userpass'
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({ token: 'mockToken123' })
        })

        it('should handle errors if authentication fails', async () => {
            const { req, res, next } = createMockReqRes({
                body: { email: 'failuser@example.com', password: 'failpass' },
            })

            mockAuthService.authenticate.mockRejectedValue(
                new Error('Authentication failed')
            )

            await authController.login(req, res, next).catch((e) => {
                expect(e).toBeInstanceOf(Error)
                expect(e.message).toBe('Authentication failed')
            })
        })
    })
})
