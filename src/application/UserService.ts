import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { IUserRepository } from './interfaces/IUserRepository'
import { IAuthService, JWTToken } from './interfaces/IAuthService'
import { CustomError } from '../utils/handdlers/CustomError'
import { StatusCodes } from 'http-status-codes'
import config from '../config'

export class AuthService implements IAuthService {
    constructor(private readonly userRepository: IUserRepository) {}

    verifyToken(token: string): JWTToken {
        try {
            return jwt.verify(token, config.auth.jwt.secret) as JWTToken
        } catch (error) {
            throw new CustomError('Invalid token', StatusCodes.UNAUTHORIZED)
        }
    }

    async authenticate(email: string, password: string): Promise<string> {
        const user = await this.userRepository.findByEmail(email)

        if (!user) {
            throw new CustomError('Not authorized', StatusCodes.UNAUTHORIZED)
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            throw new CustomError('Not authorized', StatusCodes.UNAUTHORIZED)
        }

        return jwt.sign(
            { userType: user.userType, _id: user._id as string },
            config.auth.jwt.secret,
            { expiresIn: config.auth.jwt.expiresIn }
        )
    }
}
