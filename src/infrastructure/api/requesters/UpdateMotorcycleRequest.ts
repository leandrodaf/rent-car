import { z } from 'zod'

export const UpdateMotorcycleRequest = z.object({
    plate: z.string().regex(/^[A-Z]{3}\d[A-Z]\d{2}$/, 'Invalid plate format'),
})

export type UpdateMotorcycleRequestType = z.infer<
    typeof UpdateMotorcycleRequest
>
