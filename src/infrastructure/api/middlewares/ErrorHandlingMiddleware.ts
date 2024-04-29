import { Request, Response, NextFunction } from 'express'
import { MongoServerError } from 'mongodb'

export function ErrorHandlingMiddleware() {
    return function (
        err: any,
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        if (err instanceof MongoServerError) {
            if (err.code === 11000) {
                return res.status(409).json({
                    message: 'Duplicate key error',
                    details: {
                        message: err.message,
                        keyPattern: err.keyPattern,
                        keyValue: err.keyValue,
                    },
                })
            }
        }

        if (err.httpCode) {
            return res.status(err.httpCode).json({
                message: err.message,
                details: err['errors'] || undefined,
            })
        }

        return res.status(500).json({
            message: err.message || 'An unexpected error occurred',
        })
    }
}
