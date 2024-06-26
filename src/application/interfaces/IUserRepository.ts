import { IUser, IUserModel } from '../../domain/User'

export interface IUserRepository {
    findByEmail(email: string): Promise<IUserModel | null>

    create(data: IUser): Promise<IUserModel>
}
