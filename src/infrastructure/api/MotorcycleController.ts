import { NextFunction, Request, Response } from 'express'
import { ErrorHandler } from './decorators/ErrorHandler'
import { Authorize } from './decorators/Authorize'
import { UserType } from '../../domain/User'
import { MotorcycleResource } from './resources/MotorcycleResource'
import {
    CreateMotorcycleRequest,
    CreateMotorcycleRequestType,
} from './requesters/CreateMotorcycleRequest'
import { IMotorcycleService } from '../../application/interfaces/IMotorcycleService'
import { getParams, getQueries } from './requesters/queries/PaginateQuery'
import { MotorcycleQuery } from './requesters/queries/MotorcycleQuery'
import {
    UpdateMotorcycleRequest,
    UpdateMotorcycleRequestType,
} from './requesters/UpdateMotorcycleRequest'

export class MotorcycleController {
    constructor(private readonly motorcycleService: IMotorcycleService) {}

    @Authorize([UserType.ADMIN])
    @ErrorHandler()
    async store(req: Request, response: Response, next: NextFunction) {
        const result: CreateMotorcycleRequestType =
            await CreateMotorcycleRequest.parseAsync(req.body)

        const motorcycles = await this.motorcycleService.create(result)

        response.status(201).json({ data: new MotorcycleResource(motorcycles) })
    }

    @Authorize([UserType.ADMIN])
    @ErrorHandler()
    async paginate(req: Request, response: Response, next: NextFunction) {
        const query = await getQueries(req, MotorcycleQuery)

        const result = await this.motorcycleService.paginate(query)

        response.status(200).json({
            data: result.map((item) => new MotorcycleResource(item)),
            paginate: query.paginate,
        })
    }

    @Authorize([UserType.ADMIN])
    @ErrorHandler()
    async updatePlate(req: Request, response: Response, next: NextFunction) {
        const result: UpdateMotorcycleRequestType =
            await UpdateMotorcycleRequest.parseAsync(req.body)

        const { plate } = await getParams(req, UpdateMotorcycleRequest)

        await this.motorcycleService.updateBy({ plate }, result)

        response.status(200).send()
    }

    @Authorize([UserType.ADMIN])
    @ErrorHandler()
    async delete(req: Request, response: Response, next: NextFunction) {
        const { plate } = await getParams(req, UpdateMotorcycleRequest)

        await this.motorcycleService.delete({ plate })

        response.status(200).send()
    }
}
