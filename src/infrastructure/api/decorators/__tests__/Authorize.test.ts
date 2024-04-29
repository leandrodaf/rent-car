import { Request, Response, NextFunction } from 'express'
import { Authorize } from '../Authorize'
import { UserType } from '../../../../domain/User'

describe('Authorize Decorator', () => {
    const originalMethod = jest.fn()

    const req = {
        auth: { userType: UserType.ADMIN },
    } as unknown as Request

    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    } as unknown as Response

    const next = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should execute the original method if userType is authorized', async () => {
        const descriptor = {
            value: originalMethod,
        }
        Authorize([UserType.ADMIN, UserType.DELIVERER])(
            null,
            'testMethod',
            descriptor
        )

        await descriptor.value(req, res, next)

        expect(originalMethod).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
        expect(res.send).not.toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
    })

    it('should send a 403 error if userType is not authorized', async () => {
        req.auth.userType = UserType.ADMIN

        const descriptor = {
            value: originalMethod,
        }
        Authorize([UserType.DELIVERER])(null, 'testMethod', descriptor)

        await descriptor.value(req, res, next)

        expect(originalMethod).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.send).toHaveBeenCalledWith({
            error: 'Access denied: User type not authorized',
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('should send a 403 error if userType is undefined', async () => {
        req.auth.userType = undefined // Setting undefined user type
        const descriptor = {
            value: originalMethod,
        }
        Authorize([UserType.ADMIN, UserType.DELIVERER])(
            null,
            'testMethod',
            descriptor
        )

        await descriptor.value(req, res, next)

        expect(originalMethod).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.send).toHaveBeenCalledWith({
            error: 'Access denied: User type not authorized',
        })
        expect(next).not.toHaveBeenCalled()
    })
})
