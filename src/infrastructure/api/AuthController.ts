import { NextFunction, Request, Response } from 'express'
import { IAuthService } from '../../application/interfaces/IAuthService'
import { ErrorHandler } from './decorators/ErrorHandler'
import { LoginRequest } from './requesters/LoginRequest'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../config/types'

@injectable()
export class AuthController {
    constructor(
        @inject(TYPES.AuthService)
        private readonly authService: IAuthService
    ) {}

    @ErrorHandler()
    public async login(req: Request, response: Response, next: NextFunction) {
        const result = await LoginRequest.parseAsync(req.body)

        const token = await this.authService.authenticate(
            result.email,
            result.password
        )

        response.status(200).json({ token })
    }
}
