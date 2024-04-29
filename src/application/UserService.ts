import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { IUserRepository } from './interfaces/IUserRepository'
import { IAuthService } from './interfaces/IAuthService'
import { CustomError } from '../utils/handdlers/CustomError'
import { StatusCodes } from 'http-status-codes'
import config from '../config'

export class AuthService implements IAuthService {
    constructor(private readonly userRepository: IUserRepository) {}

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
            { userType: user.userType, id: user._id as string },
            config.auth.jwt.secret,
            { expiresIn: config.auth.jwt.expiresIn }
        )
    }
}
