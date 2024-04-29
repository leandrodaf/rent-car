import { IUser, IUserModel } from '../../domain/User'

export interface IUserService {
    create(data: IUser): Promise<IUserModel>
}
