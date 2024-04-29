import { z } from 'zod'

export const PaginateQuery = z.object({
    page: z.coerce.number(z.string()).min(1).default(1),
    perPage: z.coerce.number(z.string()).min(1).default(10),
})

export type PaginateQueryType = z.infer<typeof PaginateQuery>
