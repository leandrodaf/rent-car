import { z } from 'zod'

export const CreateMotorcycleRequest = z.object({
    plate: z.string().regex(/^[A-Z]{3}\d[A-Z]\d{2}$/, 'Invalid plate format'),
    year: z.number(),
    modelName: z.string(),
})

export type CreateMotorcycleRequestType = z.infer<
    typeof CreateMotorcycleRequest
>
