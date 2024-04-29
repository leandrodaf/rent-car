import { model, Schema, Document } from 'mongoose'

export interface IMotorcycle {
    plate: string
    year: number
    modelName: string
}

export interface IMotorcycleModel extends IMotorcycle, Document {}

const motorcycleSchema: Schema<IMotorcycleModel> = new Schema(
    {
        plate: { type: String, required: true, unique: true, index: true },
        year: { type: Number, required: true },
        modelName: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
        toObject: { virtuals: true },
    }
)

export const Motorcycle = model<IMotorcycleModel>(
    'Motorcycle',
    motorcycleSchema
)
