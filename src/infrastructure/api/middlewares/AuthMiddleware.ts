import { NextFunction, Request, Response } from 'express'
import { IAuthService } from '../../../application/interfaces/IAuthService'

export class AuthMiddleware {
    constructor(private readonly authService: IAuthService) {}

    middleware(req: Request, res: Response, next: NextFunction): void {
        req.auth = {}

        try {
            const authHeader = req.headers.authorization || ''

            if (authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1]

                req.auth = this.authService.verifyToken(token)
            }

            next()
        } catch (error) {
            next()
        }
    }
}
