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

export class RentController {
    constructor(private readonly rentService: IRentService) {}

    @Authorize([UserType.DELIVERER])
    @ErrorHandler()
    async rent(req: Request, response: Response, next: NextFunction) {
        const result: CreateRentingRequestType =
            await CreateRentingRequest.parseAsync(req.body)

        if (!req.auth._id) {
            throw new CustomError('Unidentified user', StatusCodes.FORBIDDEN)
        }

        await this.rentService.renting(
            req.auth._id,
            result.startDate,
            result.endDate
        )

        response.status(202).send()
    }
}
