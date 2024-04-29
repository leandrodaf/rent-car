import { z } from 'zod'

export const CreateMotorcycleRequest = z.object({
    plate: z.string(),
    year: z.number(),
    modelName: z.string(),
})

export type CreateMotorcycleRequestType = z.infer<
    typeof CreateMotorcycleRequest
>
