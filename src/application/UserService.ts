import { IUser, IUserModel } from '../domain/User'
import { IUserRepository } from './interfaces/IUserRepository'
import { IUserService } from './interfaces/IUserService'

export class UserService implements IUserService {
    constructor(private readonly userRepository: IUserRepository) {}

    create(data: IUser): Promise<IUserModel> {
        return this.userRepository.create(data)
    }
}
