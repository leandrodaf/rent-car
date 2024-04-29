import { Query, Document, Types } from 'mongoose'
import { PaginateQueryType } from '../../application/interfaces/IRepositoryPaginate'

export function buildPaginate<T>(
    paginate: PaginateQueryType | undefined,
    query: Query<
        (Document<unknown, {}, T> & T & { _id: Types.ObjectId })[],
        Document<unknown, {}, T> & T & { _id: Types.ObjectId },
        {},
        T,
        'find'
    >
) {
    if (paginate && paginate.page && paginate.perPage) {
        const skip = (paginate.page - 1) * paginate.perPage
        query = query.skip(skip).limit(paginate.perPage)
    }

    return query
}
