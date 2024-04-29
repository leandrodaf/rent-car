import { IUserRepository } from '../../../application/interfaces/IUserRepository'
import { IUser, User, UserType } from '../../../domain/User'
import { UserRepository } from '../../repository/UserRepository'

jest.mock('../../../domain/User')

describe('UserRepository', () => {
    let userRepository: IUserRepository

    beforeEach(() => {
        jest.clearAllMocks()
        userRepository = new UserRepository()
    })

    describe('findOne', () => {
        it('should return a user when findByEmail is called with an existing email', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'John Doe',
            }
            User.findOne = jest.fn().mockResolvedValue(mockUser)

            const result = await userRepository.findByEmail('test@example.com')

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            })
            expect(result).toEqual(mockUser)
        })

        it('should return null when no user is found for the given email', async () => {
            User.findOne = jest.fn().mockResolvedValue(null)

            const result =
                await userRepository.findByEmail('nobody@example.com')

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'nobody@example.com',
            })
            expect(result).toBeNull()
        })
    })

    describe('create', () => {
        it('should create a new user and return the user object', async () => {
            const userData: IUser = {
                email: 'newuser@example.com',
                name: 'New User',
                password: 'password123',
                userType: UserType.ADMIN,
            }

            const mockUser = {
                ...userData,
                id: '2',
                save: jest.fn(),
            }

            const userSpy = jest
                .spyOn(User.prototype, 'save')
                .mockResolvedValue(mockUser)

            const result = await userRepository.create(userData)

            expect(userSpy).toHaveBeenCalled()
        })

        it('should handle errors when user creation fails', async () => {
            const userData: IUser = {
                email: 'failuser@example.com',
                name: 'Fail User',
                password: 'password123',
                userType: UserType.ADMIN,
            }

            const error = new Error('Failed to create user')
            jest.spyOn(User.prototype, 'save').mockRejectedValue(error)

            await expect(userRepository.create(userData)).rejects.toThrow(error)
        })
    })
})
