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
import { CustomError } from '../../utils/handdlers/CustomError'
import { StatusCodes } from 'http-status-codes'
import { Authorize } from './decorators/Authorize'
import { UserType } from '../../domain/User'

export class DelivererController {
    constructor(private readonly delivererService: IDelivererService) {}

    @Authorize([UserType.WEB])
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

    @Authorize([UserType.ADMIN])
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

    @Authorize([UserType.DELIVERER])
    @ErrorHandler()
    public async attachLicenseImage(
        req: Request,
        response: Response,
        next: NextFunction
    ) {
        const file = req?.file

        if (!file) {
            throw new CustomError('The file is required')
        }

        if (!req.auth._id) {
            throw new CustomError('Unidentified user', StatusCodes.FORBIDDEN)
        }

        await this.delivererService.attachDocument(req.auth._id, file)

        response.status(204).send()
    }
}
