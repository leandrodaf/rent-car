import { Request } from 'express'
import { z } from 'zod'
import {
    PaginateQuery,
    PaginateQueryType,
} from '../../../../application/interfaces/IRepositoryPaginate'

export interface FilterQuery<T> {
    paginate: PaginateQueryType
    filters: T | null
}

export async function getQueries<T>(
    data: Request,
    dataSchema?: z.ZodType<T>
): Promise<FilterQuery<T>> {
    const pagination = await PaginateQuery.parseAsync(data.query)

    if (!dataSchema) {
        return { paginate: pagination, filters: null }
    }

    const filters = await dataSchema.parseAsync(data.query)

    return { paginate: pagination, filters }
}
