import { NextFunction, Request, Response } from 'express'
import { IDelivererService } from '../../application/interfaces/IDelivererService'
import { ErrorHandler } from './decorators/ErrorHandler'
import {
    CreateDelivererRequest,
    CreateDelivererRequestType,
} from './requesters/CreateDelivererRequest'
import { DelivererResource } from './resources/DelivererResource'

export class DelivererController {
    constructor(private readonly delivererService: IDelivererService) {}

    @ErrorHandler()
    public async register(
        req: Request,
        response: Response,
        _next: NextFunction
    ) {
        const result: CreateDelivererRequestType =
            await CreateDelivererRequest.parseAsync(req.body)

        const deliverer = await this.delivererService.registerDeliverer(result)

        response.status(201).json({ data: new DelivererResource(deliverer) })
    }
}
