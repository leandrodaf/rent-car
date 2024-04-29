import { Schema, Document } from 'mongoose'
import { IUser, User } from './User'

export enum DriverLicenseType {
    A = 'A',
    B = 'B',
    A_B = 'A+B',
}

export interface IDeliverer extends IUser {
    cnpj: string
    birthDate: string
    driverLicenseNumber: string
    driverLicenseType: DriverLicenseType
    driverLicenseImageURL?: string
}

export interface IDelivererModel extends IDeliverer, Document {}

const delivererSchema = new Schema<IDelivererModel>(
    {
        cnpj: { type: String, required: true, unique: true },
        birthDate: { type: String, required: true },
        driverLicenseNumber: { type: String, required: true, unique: true },
        driverLicenseType: {
            type: String,
            required: true,
            enum: Object.values(DriverLicenseType),
        },
        driverLicenseImageURL: { type: String, required: false },
    },
    {
        timestamps: true,
        versionKey: false,
        toObject: { virtuals: true },
    }
)

export const Deliverer = User.discriminator<IDelivererModel>(
    'deliverer',
    delivererSchema
)
