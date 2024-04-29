import { StatusCodes } from 'http-status-codes'
import { IUserModel } from '../../domain/User'
import { CustomError } from '../../utils/handdlers/CustomError'
import { IUserRepository } from '../interfaces/IUserRepository'
import { AuthService } from '../UserService'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

describe('AuthService', () => {
    let authService: AuthService
    let userRepositoryMock: jest.Mocked<IUserRepository>
    let userMock: IUserModel

    beforeEach(() => {
        userRepositoryMock = {
            findByEmail: jest.fn(),
        }

        authService = new AuthService(userRepositoryMock)

        userMock = {
            _id: '123456',
            email: 'test@example.com',
            password: 'hashedPassword',
            userType: 'admin',
        } as IUserModel
    })

    describe('authenticate', () => {
        it('should authenticate user successfully', async () => {
            userRepositoryMock.findByEmail.mockResolvedValue(userMock)
            bcrypt.compare = jest.fn().mockResolvedValue(true)
            jwt.sign = jest.fn().mockReturnValue('token123')

            const token = await authService.authenticate(
                'test@example.com',
                'password123'
            )

            expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
                'test@example.com'
            )
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'password123',
                'hashedPassword'
            )
            expect(token).toEqual('token123')
        })

        it('should throw an error if user is not found', async () => {
            userRepositoryMock.findByEmail.mockResolvedValue(null)

            await expect(
                authService.authenticate('test@example.com', 'password123')
            ).rejects.toThrow(
                new CustomError('Not authorized', StatusCodes.UNAUTHORIZED)
            )

            expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
                'test@example.com'
            )
        })

        it('should throw an error if password does not match', async () => {
            userRepositoryMock.findByEmail.mockResolvedValue(userMock)
            bcrypt.compare = jest.fn().mockResolvedValue(false)

            await expect(
                authService.authenticate('test@example.com', 'wrongPassword')
            ).rejects.toThrow(
                new CustomError('Not authorized', StatusCodes.UNAUTHORIZED)
            )

            expect(bcrypt.compare).toHaveBeenCalledWith(
                'wrongPassword',
                'hashedPassword'
            )
        })
    })
})
