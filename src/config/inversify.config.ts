import { Container } from 'inversify'
import { TYPES } from './types'
import { UserRepository } from '../infrastructure/repository/UserRepository'
import { AuthService } from '../application/AuthService'
import { AuthController } from '../infrastructure/api/AuthController'
import { DelivererRepository } from '../infrastructure/repository/DelivererRepository'
import { RentPlanRepository } from '../infrastructure/repository/RentPlanRepository'
import { RentRepository } from '../infrastructure/repository/RentRepository'
import { DelivererService } from '../application/DelivererService'
import { MotorcycleService } from '../application/MotorcycleService'
import { RentBudgetService } from '../application/RentBudgetService'
import { RentService } from '../application/RentService'
import { SimplePaymentCalculationStrategy } from '../application/SimplePaymentCalculationStrategy'
import { MotorcycleController } from '../infrastructure/api/MotorcycleController'
import { RentController } from '../infrastructure/api/RentController'
import { DelivererController } from '../infrastructure/api/DelivererController'
import { MotorcycleRepository } from '../infrastructure/repository/MotorcycleRepository'
import { S3Client } from '../infrastructure/storage/S3Client'
import { AuthMiddleware } from '../infrastructure/api/middlewares/AuthMiddleware'
import { KafkaAdapter } from '../infrastructure/message/KafkaMessage'

const rentContainer = new Container()

// Bind repositories
rentContainer.bind<UserRepository>(TYPES.UserRepository).to(UserRepository)
rentContainer
    .bind<DelivererRepository>(TYPES.DelivererRepository)
    .to(DelivererRepository)
rentContainer
    .bind<MotorcycleRepository>(TYPES.MotorcycleRespository)
    .to(MotorcycleRepository)
rentContainer
    .bind<RentPlanRepository>(TYPES.RentPlanRepository)
    .to(RentPlanRepository)
rentContainer.bind<RentRepository>(TYPES.RentRepository).to(RentRepository)

// Bind services
rentContainer.bind<AuthService>(TYPES.AuthService).to(AuthService)
rentContainer
    .bind<DelivererService>(TYPES.DelivererService)
    .to(DelivererService)
rentContainer
    .bind<MotorcycleService>(TYPES.MotorcycleService)
    .to(MotorcycleService)
rentContainer
    .bind<RentBudgetService>(TYPES.RentBudgetService)
    .to(RentBudgetService)
rentContainer.bind<RentService>(TYPES.RentService).to(RentService)
rentContainer
    .bind<SimplePaymentCalculationStrategy>(
        TYPES.SimplePaymentCalculationStrategy
    )
    .to(SimplePaymentCalculationStrategy)

// Bind controllers
rentContainer.bind<AuthController>(TYPES.AuthController).to(AuthController)
rentContainer
    .bind<MotorcycleController>(TYPES.MotorcycleController)
    .to(MotorcycleController)
rentContainer.bind<RentController>(TYPES.RentController).to(RentController)
rentContainer
    .bind<DelivererController>(TYPES.DelivererController)
    .to(DelivererController)

// Bind Others
rentContainer.bind<S3Client>(TYPES.Storage).to(S3Client)

rentContainer.bind<KafkaAdapter>(TYPES.Message).to(KafkaAdapter)

// Bind middleware

rentContainer.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)

export { rentContainer as myContainer }
