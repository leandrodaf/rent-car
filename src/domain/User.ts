import bcrypt from 'bcryptjs'

import { model, Schema, Document } from 'mongoose'

export enum UserType {
    ADMIN = 'admin',
    DELIVERER = 'deliverer',
    WEB = 'web',
}

export interface IUser {
    name: string
    email: string
    userType: UserType
    password: string
}

export interface IUserModel extends IUser, Document {}

const userSchema = new Schema<IUserModel>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        userType: {
            type: String,
            required: true,
            enum: Object.values(UserType),
        },
        password: { type: String, required: true },
    },
    {
        discriminatorKey: 'userType',
        timestamps: true,
        versionKey: false,
        toObject: { virtuals: true },
    }
)

userSchema.pre('save', async function (next) {
    const user = this as IUserModel

    if (!user.isModified('password')) return next()

    const salt = await bcrypt.genSalt(10)

    user.password = await bcrypt.hash(user.password, salt)

    next()
})

userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    const user = this as IUserModel
    return bcrypt.compare(candidatePassword, user.password)
}

export const User = model<IUserModel>('User', userSchema)
