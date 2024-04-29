import { z } from 'zod'
import { RentStatus } from '../../../../domain/Rent'

export const RentQuery = z.object({
    status: z.nativeEnum(RentStatus).optional(),
})
