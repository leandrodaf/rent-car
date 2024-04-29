import { buildPaginate } from '../Paginate'
import { PaginateQueryType } from '../../../application/interfaces/IRepositoryPaginate'
import { Query } from 'mongoose'

describe('buildPaginate', () => {
    let mockQuery: Query<any, any, {}, any, 'find'>

    beforeEach(() => {
        mockQuery = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        } as any
    })

    it('should apply pagination correctly when paginate is defined', () => {
        const paginate = { page: 2, perPage: 10 }
        buildPaginate(paginate, mockQuery)

        expect(mockQuery.skip).toHaveBeenCalledWith(10) // (2 - 1) * 10
        expect(mockQuery.limit).toHaveBeenCalledWith(10)
    })

    it('should not apply pagination when paginate is undefined', () => {
        buildPaginate(undefined, mockQuery)

        expect(mockQuery.skip).not.toHaveBeenCalled()
        expect(mockQuery.limit).not.toHaveBeenCalled()
    })

    it('should not apply pagination when paginate properties are missing', () => {
        const paginate = { page: 3 } as PaginateQueryType
        buildPaginate(paginate, mockQuery)

        expect(mockQuery.skip).not.toHaveBeenCalled()
        expect(mockQuery.limit).not.toHaveBeenCalled()
    })
})
