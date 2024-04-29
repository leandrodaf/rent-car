import { z } from 'zod'

export const MotorcycleQuery = z.object({
    plate: z
        .string()
        .regex(/^[A-Z]{3}\d[A-Z]\d{2}$/)
        .optional(),
})
