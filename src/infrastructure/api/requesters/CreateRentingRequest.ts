import { z } from 'zod'
import { DateTime } from 'luxon'

const TIMEZONE = 'America/Sao_Paulo'

const dateSchema = z.string().transform((data) => {
    const parsedDate = DateTime.fromISO(data, { zone: TIMEZONE })
    if (!parsedDate.isValid) {
        throw new Error('Invalid date format')
    }
    return parsedDate.toJSDate()
})

const rentalDateSchema = z.object({
    startDate: dateSchema.refine(
        (date) => {
            const today = DateTime.now().setZone(TIMEZONE).startOf('day')
            const startDate = DateTime.fromJSDate(date)
                .setZone(TIMEZONE)
                .startOf('day')
            return startDate.toMillis() !== today.toMillis()
        },
        {
            message: "StartDate must not be today's date.",
        }
    ),
    endDate: dateSchema,
})

export const CreateRentingRequest = rentalDateSchema.refine(
    (data) => {
        const start = DateTime.fromJSDate(data.startDate).setZone(TIMEZONE)
        const end = DateTime.fromJSDate(data.endDate).setZone(TIMEZONE)
        return end >= start
    },
    {
        message: 'EndDate must be eual or later than StartDate.',
    }
)

export type CreateRentingRequestType = z.infer<typeof CreateRentingRequest>
