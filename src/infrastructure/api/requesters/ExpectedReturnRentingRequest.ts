import { z } from 'zod'
import { DateTime } from 'luxon'

const dateSchema = z.string().transform((data) => {
    const parsedDate = DateTime.fromISO(data)
    if (!parsedDate.isValid) {
        throw new Error('Invalid date format')
    }
    return parsedDate.toJSDate()
})

export const DeliverySchema = z.object({
    deliveryDate: dateSchema.refine(
        (date) => {
            const today = DateTime.now().startOf('day')
            const deliveryDate = DateTime.fromJSDate(date).startOf('day')
            return deliveryDate > today
        },
        {
            message: "Delivery date must be later than today's date.",
        }
    ),
    plate: z.string().regex(/^[A-Z]{3}\d[A-Z]\d{2}$/, 'Invalid plate format'),
})

export type DeliveryRequestType = z.infer<typeof DeliverySchema>
