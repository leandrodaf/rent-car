import { JWTToken } from '../../application/interfaces/IAuthService'

declare global {
    namespace Express {
        interface Request {
            auth: JWTToken
        }
    }
}
