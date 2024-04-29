import { z } from 'zod'
import { getQueries } from '../PaginateQuery'
import { Request } from 'express'

describe('getQueries function tests', () => {
    const filterSchema = z.object({
        name: z.string(),
        age: z.number().min(18),
    })

    test('should return valid pagination data with defaults when no data is provided', async () => {
        const data = {
            query: {},
        } as Request

        const result = await getQueries(data)
        expect(result.paginate).toEqual({ page: 1, perPage: 10 })
        expect(result.filters).toBeNull()
    })

    test('should throw an error for invalid pagination data', async () => {
        const data = { query: { page: 0, perPage: 5 } } as unknown as Request
        await expect(getQueries(data)).rejects.toThrow(
            'Number must be greater than or equal to 1'
        )
    })

    test('should return valid pagination and null filters when no filter schema is provided', async () => {
        const data = { query: { page: 2, perPage: 5 } } as unknown as Request
        const result = await getQueries(data)
        expect(result.paginate).toEqual({ page: 2, perPage: 5 })
        expect(result.filters).toBeNull()
    })

    test('should validate and return both pagination and filters when filter schema is provided', async () => {
        const data = {
            query: { page: 1, perPage: 5, name: 'John', age: 30 },
        } as unknown as Request
        const result = await getQueries(data, filterSchema)
        expect(result.paginate).toEqual({ page: 1, perPage: 5 })
        expect(result.filters).toEqual({ name: 'John', age: 30 })
    })

    test('should throw an error for invalid filter data', async () => {
        const data = {
            query: { page: 1, perPage: 5, name: 'John', age: 17 },
        } as unknown as Request
        await expect(getQueries(data, filterSchema)).rejects.toThrow(
            'Number must be greater than or equal to 18'
        )
    })
})
