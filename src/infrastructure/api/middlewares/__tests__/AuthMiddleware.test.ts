import {
    IAuthService,
    JWTToken,
} from '../../../../application/interfaces/IAuthService'

import { AuthMiddleware } from '../AuthMiddleware'

import { createMockReqRes } from '../../../../utils/tests/testHelpers'
describe('AuthMiddleware', () => {
    let authServiceMock: jest.Mocked<IAuthService>
    let middleware: AuthMiddleware

    beforeEach(() => {
        authServiceMock = {
            authenticate: jest.fn(),
            verifyToken: jest.fn(),
        }

        middleware = new AuthMiddleware(authServiceMock)
    })

    it('should authenticate and attach user details if token is valid', () => {
        const token = 'valid-token'

        const { req, res, next } = createMockReqRes({
            headers: { authorization: `Bearer ${token}` },
        })

        const userData = { id: '123', role: 'user' }

        authServiceMock.verifyToken.mockReturnValue(userData)

        middleware.middleware(req, res, next)

        expect(authServiceMock.verifyToken).toHaveBeenCalledWith(token)
        expect(req.auth).toEqual(userData)
        expect(next).toHaveBeenCalledTimes(1)
    })

    it('should call next with no user details if no authorization header is present', () => {
        const { req, res, next } = createMockReqRes({})

        middleware.middleware(req, res, next)

        expect(req.auth).toBeDefined()
        expect(next).toHaveBeenCalledTimes(1)
    })

    it('should call next with no user details if token is invalid', () => {
        const token = 'invalid-token'

        const { req, res, next } = createMockReqRes({
            headers: {
                authorization: `Bearer ${token}`,
            },
        })

        authServiceMock.verifyToken.mockReturnValue({} as JWTToken)

        middleware.middleware(req, res, next)

        expect(authServiceMock.verifyToken).toHaveBeenCalledWith(token)
        expect(next).toHaveBeenCalledTimes(1)
    })

    it('should handle exceptions by calling next', () => {
        const token = 'exception-token'

        const { req, res, next } = createMockReqRes({
            headers: {
                authorization: `Bearer ${token}`,
            },
        })

        authServiceMock.verifyToken.mockImplementation(() => {
            throw new Error('Token processing error')
        })

        middleware.middleware(req, res, next)

        expect(authServiceMock.verifyToken).toHaveBeenCalledWith(token)
        expect(next).toHaveBeenCalledTimes(1)
    })
})
