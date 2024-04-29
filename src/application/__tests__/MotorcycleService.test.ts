import { MotorcycleService } from '../MotorcycleService'
import { IMotorcycleRespository } from '../interfaces/IMotorcycleRespository'
import { IMotorcycle, IMotorcycleModel } from '../../domain/Motorcycle'

const motorcycleRespository: IMotorcycleRespository = {
    create: jest.fn(),
}

describe('MotorcycleService', () => {
    let service: MotorcycleService

    beforeEach(() => {
        jest.clearAllMocks()

        service = new MotorcycleService(motorcycleRespository)
    })

    describe('create', () => {
        let testMotorcycle: IMotorcycle

        beforeEach(() => {
            testMotorcycle = {
                plate: 'example-plate',
                year: 2024,
                modelName: 'foo',
            }
        })

        it('should call the create method on the deliverer repository with the correct deliverer data', async () => {
            const expectedMotorcycleModel = {
                ...testMotorcycle,
                _id: '1',
            } as IMotorcycleModel

            motorcycleRespository.create = jest
                .fn()
                .mockResolvedValue(expectedMotorcycleModel)

            const result = await service.create(testMotorcycle)

            expect(motorcycleRespository.create).toHaveBeenCalledWith(
                testMotorcycle
            )

            expect(result).toBe(expectedMotorcycleModel)
        })
    })
})
