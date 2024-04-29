import { Request, Response, NextFunction } from 'express'
import { UserType } from '../../../domain/User'

export function Authorize(allowedTypes: UserType[]) {
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
            const userType = req.auth?.userType

            if (userType !== undefined && allowedTypes.includes(userType)) {
                await originalMethod.apply(this, [req, res, next])
            } else {
                res.status(403).send({
                    error: 'Access denied: User type not authorized',
                })
            }
        }
    }
}
