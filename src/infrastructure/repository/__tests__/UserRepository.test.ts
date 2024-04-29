import { IUserRepository } from '../../../application/interfaces/IUserRepository'
import { User } from '../../../domain/User'
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
})
