import { StatusCodes } from 'http-status-codes'

export class CustomError extends Error {
    public httpCode: number

    constructor(
        message: string = 'Fatal server error',
        httpCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR
    ) {
        super(message)

        this.httpCode = httpCode

        Error.captureStackTrace(this, this.constructor)
    }
}
