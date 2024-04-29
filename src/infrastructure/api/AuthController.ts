import { NextFunction, Request, Response } from 'express'
import { IAuthService } from '../../application/interfaces/IAuthService'
import { LoginRequest } from './requesters/CreateLogin'
import { ErrorHandler } from './decorators/ErrorHandler'

export class AuthController {
    constructor(private readonly authService: IAuthService) {}

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
