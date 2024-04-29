import { Schema, Document, model } from 'mongoose'
import { IDelivererModel } from './Deliverer'
import { IMotorcycle } from './Motorcycle'

export enum RentStatus {
    PROCESSING = 'processing',
    REJECTED = 'rejected',
    RENTED = 'rented',
    DONE = 'done',
}

export interface IRent {
    deliverer: IDelivererModel
    motorcycle?: IMotorcycle
    plan: {
        days: number
        dailyRate: number
    }
    startDate: Date
    endDate: Date
    deliveryForecastDate: Date
    totalCost: number

    status?: RentStatus
}

export interface IRentModel extends IRent, Document {}

const rentSchema = new Schema<IRentModel>(
    {
        deliverer: {
            type: Schema.Types.ObjectId,
            ref: 'Deliverer',
            required: true,
        },
        motorcycle: {
            type: Schema.Types.ObjectId,
            ref: 'Motorcycle',
            required: false,
        },
        plan: {
            days: { type: Number, required: true },
            dailyRate: { type: Number, required: true },
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        totalCost: { type: Number, required: true, default: 0 },
        status: {
            type: String,
            required: true,
            enum: Object.values(RentStatus),
            default: RentStatus.PROCESSING,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toObject: { virtuals: true },
    }
)

export const Rent = model<IRentModel>('Rent', rentSchema)
