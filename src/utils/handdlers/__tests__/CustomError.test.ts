import { CustomError } from '../CustomError'
import { StatusCodes } from 'http-status-codes'

describe('CustomError', () => {
    it('should create an error with the specified message and http code', () => {
        const testMessage = 'Test error message'
        const testStatusCode = StatusCodes.BAD_REQUEST

        const error = new CustomError(testMessage, testStatusCode)

        expect(error.message).toBe(testMessage)
        expect(error.httpCode).toBe(testStatusCode)
    })

    it('should create an error with default message and http code when no parameters are passed', () => {
        const defaultStatusCode = StatusCodes.INTERNAL_SERVER_ERROR
        const defaultMessage = 'Fatal server error'

        const error = new CustomError()

        expect(error.message).toBe(defaultMessage)
        expect(error.httpCode).toBe(defaultStatusCode)
    })
})
