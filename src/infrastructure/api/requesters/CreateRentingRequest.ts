import { z } from 'zod'
import { DateTime } from 'luxon'

const dateSchema = z.string().transform((data) => {
    const parsedDate = DateTime.fromISO(data)
    if (!parsedDate.isValid) {
        throw new Error('Invalid date format')
    }
    return parsedDate.toJSDate()
})

const rentalDateSchema = z.object({
    endDate: dateSchema,
})

const start = DateTime.now().startOf('day').plus({ days: 1 })

export const CreateRentingRequest = rentalDateSchema.refine(
    (data) => {
        const end = DateTime.fromJSDate(data.endDate)
        return end >= start
    },
    {
        message: 'EndDate must be equal or later than StartDate.',
    }
)

export type CreateRentingRequestType = z.infer<typeof CreateRentingRequest>
