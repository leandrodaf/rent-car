import { inject, injectable } from 'inversify'
import { IUser, IUserModel } from '../domain/User'
import { IUserRepository } from './interfaces/IUserRepository'
import { IUserService } from './interfaces/IUserService'
import { TYPES } from '../config/types'

@injectable()
export class UserService implements IUserService {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) {}

    create(data: IUser): Promise<IUserModel> {
        return this.userRepository.create(data)
    }
}
