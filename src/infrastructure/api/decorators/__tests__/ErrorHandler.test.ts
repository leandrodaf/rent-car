import { ErrorHandler } from '../ErrorHandler'

describe('ErrorHandler Middleware', () => {
    it('should execute the original method without errors', async () => {
        const originalMethod = jest.fn().mockResolvedValue('Success')
        const req = {}
        const res = {}
        const next = jest.fn()

        const descriptor = {
            value: originalMethod,
        }
        ErrorHandler()(null, 'testMethod', descriptor)

        await descriptor.value(req, res, next)
        expect(originalMethod).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
    })

    it('should handle and pass error to next if original method throws', async () => {
        const originalMethod = jest
            .fn()
            .mockRejectedValue(new Error('Test error'))
        const req = {}
        const res = {}
        const next = jest.fn()

        const descriptor = {
            value: originalMethod,
        }
        ErrorHandler()(null, 'testMethod', descriptor)

        await descriptor.value(req, res, next)
        expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
})
