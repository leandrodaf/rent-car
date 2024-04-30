import { NextFunction, Request, Response } from 'express'
import { IAuthService } from '../../../application/interfaces/IAuthService'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../../config/types'

@injectable()
export class AuthMiddleware {
    constructor(
        @inject(TYPES.AuthService)
        private readonly authService: IAuthService
    ) {}

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
