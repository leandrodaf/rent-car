import { NextFunction, Request, Response } from 'express'
import { ErrorHandler } from './decorators/ErrorHandler'
import { Authorize } from './decorators/Authorize'
import { UserType } from '../../domain/User'

import {
    CreateRentingRequest,
    CreateRentingRequestType,
} from './requesters/CreateRentingRequest'
import { IRentService } from '../../application/interfaces/IRentService'
import { CustomError } from '../../utils/handdlers/CustomError'
import { StatusCodes } from 'http-status-codes'
import { getQueries } from './requesters/queries/PaginateQuery'
import { RentQuery } from './requesters/queries/RentQuery'
import { RentResource } from './resources/RentResource'
import {
    DeliveryRequestType,
    DeliverySchema,
} from './requesters/ExpectedReturnRentingRequest'
import { IRentBudgetService } from '../../application/interfaces/IRentBudgetService'
import { ExpectedPriceResource } from './resources/ExpectedPriceResource'

export class RentController {
    constructor(
        private readonly rentService: IRentService,
        private readonly rentBudgetService: IRentBudgetService
    ) {}

    @Authorize([UserType.DELIVERER])
    @ErrorHandler()
    async rent(req: Request, response: Response, next: NextFunction) {
        const result: CreateRentingRequestType =
            await CreateRentingRequest.parseAsync(req.body)

        if (!req.auth._id) {
            throw new CustomError('Unidentified user', StatusCodes.FORBIDDEN)
        }

        await this.rentService.renting(req.auth._id, result.endDate)

        response.status(202).send()
    }

    @Authorize([UserType.DELIVERER])
    @ErrorHandler()
    async paginate(req: Request, response: Response, next: NextFunction) {
        const query = await getQueries(req, RentQuery)

        const result = await this.rentService.paginate(query)

        response.status(200).json({
            data: result.map((item) => new RentResource(item)),
            paginate: query.paginate,
        })
    }

    @Authorize([UserType.DELIVERER])
    @ErrorHandler()
    async expectedReturn(req: Request, response: Response, next: NextFunction) {
        const result: DeliveryRequestType = await DeliverySchema.parseAsync(
            req.body
        )

        if (!req.auth._id) {
            throw new CustomError('Unidentified user', StatusCodes.FORBIDDEN)
        }

        const data = await this.rentBudgetService.expectedReturn(
            req.auth._id,
            result.plate,
            result.deliveryDate
        )

        response.status(200).json({
            data: new ExpectedPriceResource(data, result.deliveryDate),
        })
    }

    @Authorize([UserType.DELIVERER])
    @ErrorHandler()
    async finalizeRent(req: Request, response: Response, next: NextFunction) {
        const result: DeliveryRequestType = await DeliverySchema.parseAsync(
            req.body
        )

        if (!req.auth._id) {
            throw new CustomError('Unidentified user', StatusCodes.FORBIDDEN)
        }

        await this.rentBudgetService.finalizeRent(
            req.auth._id,
            result.plate,
            result.deliveryDate
        )

        response.status(200).send()
    }
}
