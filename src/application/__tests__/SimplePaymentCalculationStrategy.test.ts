import { DateTime } from 'luxon'
import { SimplePaymentCalculationStrategy } from '../SimplePaymentCalculationStrategy'
import { IRentModel, RentStatus } from '../../domain/Rent'

describe('SimplePaymentCalculationStrategy', () => {
    let strategy: SimplePaymentCalculationStrategy
    let rental: IRentModel
    let originalNow: any

    beforeEach(() => {
        jest.resetAllMocks()
        strategy = new SimplePaymentCalculationStrategy()
    })

    beforeAll(() => {
        originalNow = DateTime.now
        DateTime.now = () => DateTime.fromISO('2024-04-29T00:00:00.000Z') as any
    })

    afterAll(() => {
        DateTime.now = originalNow
    })

    describe('final day', () => {
        test('Delivered on the final day of signing - 15 days', () => {
            rental = {
                id: '1',
                startDate: new Date('2024-04-30'),
                endDate: new Date('2024-05-14'),
                plan: { days: 15, dailyRate: 2800 },
                totalCost: 0,
                status: RentStatus.PROCESSING,
                deliveryForecastDate: new Date('2024-05-14'),
            } as unknown as IRentModel

            const finalDayReturn = DateTime.fromJSDate(new Date('2024-05-14'))
            const result = strategy.calculateCost(rental, finalDayReturn)

            expect(result.totalCost).toEqual(42000) // R$420.00
        })
    })

    describe('early', () => {
        test('Delivered one day early - 7 days', () => {
            rental = {
                id: '2',
                startDate: new Date('2024-05-01'),
                endDate: new Date('2024-05-07'),
                plan: { days: 7, dailyRate: 3000 },
                totalCost: 0,
                status: RentStatus.PROCESSING,
                deliveryForecastDate: new Date('2024-05-07'),
            } as unknown as IRentModel

            const earlyReturnDate = DateTime.fromJSDate(new Date('2024-05-06'))
            const result = strategy.calculateCost(rental, earlyReturnDate)

            expect(result.totalCost).toEqual(18600) // R$186.00
        })

        test('Delivered one day early - 15 days', () => {
            rental = {
                id: '4',
                startDate: new Date('2024-05-01'),
                endDate: new Date('2024-05-16'),
                plan: { days: 15, dailyRate: 2800 },
                totalCost: 0,
                status: RentStatus.PROCESSING,
                deliveryForecastDate: new Date('2024-05-16'),
            } as unknown as IRentModel

            const earlyReturnDate = DateTime.fromJSDate(new Date('2024-05-14'))
            const result = strategy.calculateCost(rental, earlyReturnDate)

            expect(result.totalCost).toEqual(40320) // R$403.20
        })
    })

    describe('late', () => {
        test('Delivered one day late - 15 days', () => {
            rental = {
                id: '4',
                startDate: new Date('2024-05-01'),
                endDate: new Date('2024-05-16'),
                plan: { days: 15, dailyRate: 2800 },
                totalCost: 0,
                status: RentStatus.PROCESSING,
                deliveryForecastDate: new Date('2024-05-16'),
            } as unknown as IRentModel

            const lateReturnDate = DateTime.fromJSDate(new Date('2024-05-17'))
            const result = strategy.calculateCost(rental, lateReturnDate)

            // 15 days used cost: R$420.00, 1 day late penalty: R$50.00
            expect(result.totalCost).toEqual(47000) // R$470.00
        })
    })

    describe('penalties', () => {
        test('Delivered on time - 30 days with no penalties', () => {
            rental = {
                id: '5',
                startDate: new Date('2024-05-01'),
                endDate: new Date('2024-05-31'),
                plan: { days: 30, dailyRate: 2200 },
                totalCost: 0,
                status: RentStatus.PROCESSING,
                deliveryForecastDate: new Date('2024-05-31'),
            } as unknown as IRentModel

            const onTimeReturnDate = DateTime.fromJSDate(new Date('2024-05-31'))
            const result = strategy.calculateCost(rental, onTimeReturnDate)

            expect(result.totalCost).toEqual(66000) // R$660.00
        })
    })

    describe('no penalty plans', () => {
        test('Delivered one day early - 30 days with no penalty', () => {
            rental = {
                id: '3',
                startDate: new Date('2024-05-01'),
                endDate: new Date('2024-05-31'),
                plan: { days: 30, dailyRate: 2200 },
                totalCost: 0,
                status: RentStatus.PROCESSING,
                deliveryForecastDate: new Date('2024-05-3'),
            } as unknown as IRentModel

            const earlyReturnDate = DateTime.fromJSDate(new Date('2024-05-30'))
            const result = strategy.calculateCost(rental, earlyReturnDate)

            expect(result.totalCost).toEqual(66000)
        })
    })
})
