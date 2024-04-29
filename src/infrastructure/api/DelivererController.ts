import { NextFunction, Request, Response } from 'express'
import { IDelivererService } from '../../application/interfaces/IDelivererService'
import { ErrorHandler } from './decorators/ErrorHandler'
import {
    CreateDelivererRequest,
    CreateDelivererRequestType,
} from './requesters/CreateDelivererRequest'
import { DelivererResource } from './resources/DelivererResource'
import { getQueries } from './requesters/queries/PaginateQuery'
import { DelivererQuery } from './requesters/queries/DelivererQuery'

export class DelivererController {
    constructor(private readonly delivererService: IDelivererService) {}

    @ErrorHandler()
    public async register(
        req: Request,
        response: Response,
        next: NextFunction
    ) {
        const result: CreateDelivererRequestType =
            await CreateDelivererRequest.parseAsync(req.body)

        const deliverer = await this.delivererService.registerDeliverer(result)

        response.status(201).json({ data: new DelivererResource(deliverer) })
    }

    @ErrorHandler()
    public async paginate(
        req: Request,
        response: Response,
        next: NextFunction
    ) {
        const query = await getQueries(req, DelivererQuery)

        const result = await this.delivererService.paginate(query)

        response.status(200).json({
            data: result.map((item) => new DelivererResource(item)),
            paginate: query.paginate,
        })
    }
}
