import { IUserModel } from '../../domain/User'

export interface IUserRepository {
    findByEmail(email: string): Promise<IUserModel | null>
}
