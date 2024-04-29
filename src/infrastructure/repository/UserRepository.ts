import { IUserRepository } from '../../application/interfaces/IUserRepository'
import { User } from '../../domain/User'

export class UserRepository implements IUserRepository {
    findByEmail(email: string) {
        return User.findOne({ email })
    }
}
