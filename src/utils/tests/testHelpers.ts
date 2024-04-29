import { NextFunction, Request, Response } from 'express'
import { JWTToken } from '../../application/interfaces/IAuthService'

interface MockReqOptions {
    body?: Record<string, any>
    params?: Record<string, string>
    query?: Record<string, string>
    file?: Express.Multer.File | undefined
    headers?: Record<string, string> | undefined
    auth?: JWTToken
}

/**
 * Creates and returns mock objects for Express's req and res.
 * Allows customization of the request body, params, and query.
 *
 * @param options - Optional parameters to customize the request.
 * @returns An object containing the mocked req and res objects.
 */
export function createMockReqRes(options: MockReqOptions): {
    req: Request
    res: Response
    next: NextFunction
} {
    const req = {
        body: options.body || {},
        params: options.params || {},
        query: options.query || {},
        file: options.file || undefined,
        headers: options.headers || {},
        auth: options.auth || {},
    } as Request

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response

    const next = jest.fn()

    return { req, res, next }
}
