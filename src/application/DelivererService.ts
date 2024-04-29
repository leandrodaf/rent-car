import { v4 } from 'uuid'

import { IDeliverer, IDelivererModel } from '../domain/Deliverer'
import { FilterQuery } from '../infrastructure/api/requesters/queries/PaginateQuery'
import { IDelivererRepository } from './interfaces/IDelivererRepository'
import { IDelivererService } from './interfaces/IDelivererService'
import { StatusCodes } from 'http-status-codes'
import { CustomError } from '../utils/handdlers/CustomError'
import { IStorage } from '../infrastructure/storage/IStorage'
import config from '../config'

export class DelivererService implements IDelivererService {
    constructor(
        private readonly delivererRepository: IDelivererRepository,
        private readonly storage: IStorage
    ) {}

    async findById(id: string): Promise<IDelivererModel> {
        const deliverer = await this.delivererRepository.findById(id)

        if (!deliverer) {
            throw new CustomError('Deliverer not found', StatusCodes.NOT_FOUND)
        }

        return deliverer
    }

    async attachDocument(
        id: string,
        file: Express.Multer.File
    ): Promise<IDelivererModel> {
        const deliverer = await this.delivererRepository.findById(id)

        if (!deliverer) {
            throw new CustomError('Deliverer not found', StatusCodes.NOT_FOUND)
        }

        if (deliverer.driverLicenseImageURL) {
            await this.storage.deleteFile(
                config.storage.s3.bucketName,
                deliverer.driverLicenseImageURL
            )
        }

        const fileId = v4()
        const fileKey = `assets/${fileId}`
        const bucketName = config.storage.s3.bucketName
        const contentType = file.mimetype

        await this.storage.uploadFile(
            bucketName,
            `${fileKey}.${contentType.split('/')[1]}`,
            file.buffer,
            contentType
        )
        const driverLicenseImageURL = `${bucketName}/${fileKey}`

        const updated = await this.delivererRepository.update(id, {
            driverLicenseImageURL,
        })

        return updated as IDelivererModel
    }

    async paginate(
        search: FilterQuery<Partial<IDelivererModel>>
    ): Promise<IDelivererModel[]> {
        const { filters, paginate } = search

        const deliveries = await this.delivererRepository.filter(
            filters,
            paginate
        )

        return deliveries.length ? deliveries : []
    }

    registerDeliverer(deliverer: IDeliverer): Promise<IDelivererModel> {
        return this.delivererRepository.create(deliverer)
    }
}
