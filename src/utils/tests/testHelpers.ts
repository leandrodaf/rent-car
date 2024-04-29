import { NextFunction, Request, Response } from 'express'

interface MockReqOptions {
    body?: Record<string, any>
    params?: Record<string, string>
    query?: Record<string, string>
}

/**
 * Creates and returns mock objects for Express's req and res.
 * Allows customization of the request body, params, and query.
 *
 * @param options - Optional parameters to customize the request.
 * @returns An object containing the mocked req and res objects.
 */
export function createMockReqRes(options: MockReqOptions = {}): {
    req: Request
    res: Response
    next: NextFunction
} {
    const req = {
        body: options.body || {},
        params: options.params || {},
        query: options.query || {},
    } as Request

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response

    const next = jest.fn()

    return { req, res, next }
}
