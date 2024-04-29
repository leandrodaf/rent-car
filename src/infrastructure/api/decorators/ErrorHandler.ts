import { Request, Response, NextFunction } from 'express'

export function ErrorHandler() {
    return function (
        target: any,
        propertyName: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value

        descriptor.value = async function (
            req: Request,
            res: Response,
            next: NextFunction
        ) {
            try {
                await originalMethod.apply(this, [req, res, next])
            } catch (error) {
                next(error)
            }
        }
    }
}
