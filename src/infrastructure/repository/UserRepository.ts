import { injectable } from 'inversify'
import { IUserRepository } from '../../application/interfaces/IUserRepository'
import { IUser, IUserModel, User } from '../../domain/User'

@injectable()
export class UserRepository implements IUserRepository {
    findByEmail(email: string) {
        return User.findOne({ email })
    }

    async create(data: IUser): Promise<IUserModel> {
        const adminUser = new User(data)

        await adminUser.save()

        return adminUser
    }
}
