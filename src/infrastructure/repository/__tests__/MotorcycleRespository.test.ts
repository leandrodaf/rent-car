import { MotorcycleRespository } from '../MotorcycleRespository'
import {
    IMotorcycle,
    IMotorcycleModel,
    Motorcycle,
} from '../../../domain/Motorcycle'
import { IMotorcycleRespository } from '../../../application/interfaces/IMotorcycleRespository'

jest.mock('../../../domain/Motorcycle')

describe('MotorcycleRepository', () => {
    let motorcycleRepository: IMotorcycleRespository

    beforeEach(() => {
        jest.clearAllMocks()
        motorcycleRepository = new MotorcycleRespository()
    })

    describe('create', () => {
        it('Must call the mongoose apis to create a motorcycle', async () => {
            const mockMotorcycle = {} as IMotorcycleModel

            Motorcycle.create = jest.fn().mockResolvedValue(mockMotorcycle)

            const data = {
                plate: 'example-plate',
                year: 2024,
                modelName: 'foo',
            } as IMotorcycle

            const result = await motorcycleRepository.create(data)

            expect(Motorcycle.create).toHaveBeenCalledWith(data)
            expect(result).toEqual(mockMotorcycle)
        })
    })
})
