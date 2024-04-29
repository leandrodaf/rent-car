import {
    DriverLicenseType,
    IDeliverer,
    IDelivererModel,
} from '../../domain/Deliverer'
import { UserType } from '../../domain/User'
import { FilterQuery } from '../../infrastructure/api/requesters/queries/PaginateQuery'
import { DelivererService } from '../DelivererService'
import { IDelivererRepository } from '../interfaces/IDelivererRepository'
import { IStorage } from '../../infrastructure/storage/IStorage'
import { CustomError } from '../../utils/handdlers/CustomError'
import { StatusCodes } from 'http-status-codes'
import config from '../../config'

const mockDelivererRepository: IDelivererRepository = {
    create: jest.fn(),
    filter: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
}

const mockStorage: IStorage = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
}

describe('DelivererService', () => {
    let service: DelivererService

    beforeEach(() => {
        jest.clearAllMocks()

        service = new DelivererService(mockDelivererRepository, mockStorage)
    })

    describe('create', () => {
        let testDeliverer: IDeliverer

        beforeEach(() => {
            testDeliverer = {
                name: 'foo',
                driverLicenseImageURL: 'http://example.com/license.jpg',
                password: 'securePassword123',
                email: 'test@example.com',
                cnpj: '12345678901234',
                birthDate: '1980-01-01',
                driverLicenseNumber: 'D1234567',
                driverLicenseType: DriverLicenseType.A,
                userType: UserType.ADMIN,
            }
        })

        it('should call the create method on the deliverer repository with the correct deliverer data', async () => {
            const expectedDelivererModel = {
                ...testDeliverer,
                _id: '1',
            } as IDelivererModel

            mockDelivererRepository.create = jest
                .fn()
                .mockResolvedValue(expectedDelivererModel)

            const result = await service.registerDeliverer(testDeliverer)

            expect(mockDelivererRepository.create).toHaveBeenCalledWith(
                testDeliverer
            )

            expect(result).toBe(expectedDelivererModel)
        })
    })

    describe('paginate', () => {
        it('must call the repository and return an empty list', async () => {
            const mockResponse: IDelivererModel[] = []

            mockDelivererRepository.filter = jest
                .fn()
                .mockResolvedValue(mockResponse)

            const search: FilterQuery<Partial<IDeliverer>> = {
                paginate: {
                    page: 1,
                    perPage: 10,
                },
                filters: null,
            }

            const result = await service.paginate(search)

            expect(mockDelivererRepository.filter).toHaveBeenCalledWith(
                search.filters,
                search.paginate
            )

            expect(result).toEqual(mockResponse)
        })

        it('should call the repository and return one of the objects', async () => {
            const mockResponse: IDelivererModel[] = [
                {
                    cnpj: 'foo',
                    birthDate: '2024-01-01',
                    driverLicenseNumber: 'foo',
                    driverLicenseType: DriverLicenseType.A,
                } as IDelivererModel,
            ]

            mockDelivererRepository.filter = jest
                .fn()
                .mockResolvedValue(mockResponse)

            const search: FilterQuery<Partial<IDeliverer>> = {
                paginate: {
                    page: 1,
                    perPage: 10,
                },
                filters: null,
            }

            const result = await service.paginate(search)

            expect(mockDelivererRepository.filter).toHaveBeenCalledWith(
                search.filters,
                search.paginate
            )

            expect(result).toEqual(mockResponse)
        })
    })

    describe('attachDocument', () => {
        const multerFile = {
            mimetype: 'image/jpeg',
            buffer: Buffer.from('test'),
        } as Express.Multer.File

        it('should throw an error if deliverer is not found', async () => {
            mockDelivererRepository.findById = jest.fn().mockResolvedValue(null)

            await expect(
                service.attachDocument('1', multerFile)
            ).rejects.toThrow(
                new CustomError('Deliverer not found', StatusCodes.NOT_FOUND)
            )
        })

        it('should upload a new file if no previous image exists', async () => {
            const deliverer = { _id: '1', driverLicenseImageURL: null }
            mockDelivererRepository.findById = jest
                .fn()
                .mockResolvedValue(deliverer)
            mockDelivererRepository.update = jest
                .fn()
                .mockResolvedValue(deliverer)

            await service.attachDocument('1', multerFile)

            expect(mockStorage.uploadFile).toHaveBeenCalled()
            expect(mockDelivererRepository.update).toHaveBeenCalledWith('1', {
                driverLicenseImageURL: expect.any(String),
            })
        })

        it('should delete the old file and upload a new one if a previous image exists', async () => {
            const deliverer = {
                _id: '1',
                driverLicenseImageURL: 'test-bucket/assets/oldFileId.jpg',
            }
            mockDelivererRepository.findById = jest
                .fn()
                .mockResolvedValue(deliverer)
            mockDelivererRepository.update = jest
                .fn()
                .mockResolvedValue(deliverer)

            await service.attachDocument('1', multerFile)

            expect(mockStorage.deleteFile).toHaveBeenCalledWith(
                config.storage.s3.bucketName,
                'test-bucket/assets/oldFileId.jpg'
            )
            expect(mockStorage.uploadFile).toHaveBeenCalled()
            expect(mockDelivererRepository.update).toHaveBeenCalledWith('1', {
                driverLicenseImageURL: expect.any(String),
            })
        })

        it('should handle storage upload errors', async () => {
            const deliverer = { _id: '1', driverLicenseImageURL: null }
            mockDelivererRepository.findById = jest
                .fn()
                .mockResolvedValue(deliverer)
            mockStorage.uploadFile = jest
                .fn()
                .mockRejectedValue(new Error('Storage failure'))

            await expect(
                service.attachDocument('1', multerFile)
            ).rejects.toThrow('Storage failure')

            expect(mockStorage.uploadFile).toHaveBeenCalled()
        })
    })

    describe('findById', () => {
        it('should return a deliverer when found', async () => {
            const mockDeliverer = {
                _id: '1',
                cnpj: '12345678901234',
                birthDate: '1980-01-01',
                driverLicenseNumber: 'D1234567',
                driverLicenseType: DriverLicenseType.A,
                name: 'John Doe',
                driverLicenseImageURL: 'http://example.com/license.jpg',
                password: 'securePassword123',
                email: 'john@example.com',
                userType: UserType.ADMIN,
            } as IDelivererModel

            mockDelivererRepository.findById = jest
                .fn()
                .mockResolvedValue(mockDeliverer)

            const result = await service.findById('1')

            expect(mockDelivererRepository.findById).toHaveBeenCalledWith('1')
            expect(result).toEqual(mockDeliverer)
        })

        it('should throw an error when deliverer not found', async () => {
            mockDelivererRepository.findById = jest.fn().mockResolvedValue(null)

            await expect(service.findById('999')).rejects.toThrow(
                new CustomError('Deliverer not found', StatusCodes.NOT_FOUND)
            )
        })
    })
})
