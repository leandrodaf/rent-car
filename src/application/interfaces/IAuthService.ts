import { JwtPayload } from 'jsonwebtoken'
import { IUserModel } from '../../domain/User'

export interface JWTToken extends JwtPayload {
    _id?: string
    userType?: IUserModel['userType']
}

export interface IAuthService {
    authenticate(email: string, password: string): Promise<string>

    verifyToken(token: string): JWTToken
}
