import express from 'express'
import { ICMD } from './ICMD'
import { UserRepository } from '../infrastructure/repository/UserRepository'
import { AuthService } from '../application/AuthService'
import { AuthController } from '../infrastructure/api/AuthController'
import { MongoConnectionManager } from '../infrastructure/database/MongoConnectionManager'
import { ErrorHandlingMiddleware } from '../infrastructure/api/middlewares/ErrorHandlingMiddleware'
import { DelivererController } from '../infrastructure/api/DelivererController'
import { DelivererRepository } from '../infrastructure/repository/DelivererRepository'
import { DelivererService } from '../application/DelivererService'
import { upload } from '../infrastructure/api/MulterUpload'
import { AuthMiddleware } from '../infrastructure/api/middlewares/AuthMiddleware'
import { S3Client } from '../infrastructure/storage/S3Client'
import { MotorcycleController } from '../infrastructure/api/MotorcycleController'
import { MotorcycleService } from '../application/MotorcycleService'
import { MotorcycleRespository } from '../infrastructure/repository/MotorcycleRespository'
import logger from '../utils/logger'
import { RentController } from '../infrastructure/api/RentController'
import { RentService } from '../application/RentService'
import { RentPlanRepository } from '../infrastructure/repository/RentPlanRepository'
import { RentRepository } from '../infrastructure/repository/RentRepository'

export class APIServer implements ICMD {
    private app: express.Application

    constructor() {
        this.app = express()
        this.setupRoutes()
        this.setupErrorHandling()
    }

    private setupRoutes(): void {
        const storage = new S3Client()

        const userRepository = new UserRepository()
        const delivererRepository = new DelivererRepository()
        const motorcycleRespository = new MotorcycleRespository()
        const rentPlanRepository = new RentPlanRepository()
        const rentRepository = new RentRepository()

        const authService = new AuthService(userRepository)
        const delivererService = new DelivererService(
            delivererRepository,
            storage
        )

        const motorcycleService = new MotorcycleService(motorcycleRespository)
        const rentService = new RentService(
            rentRepository,
            delivererService,
            rentPlanRepository
        )

        const authController = new AuthController(authService)
        const delivererController = new DelivererController(delivererService)
        const motorcycleController = new MotorcycleController(motorcycleService)

        const rentController = new RentController(rentService)

        const authMiddleware = new AuthMiddleware(authService)

        this.app.use(express.json())

        // Middlewares
        this.app.use(authMiddleware.middleware.bind(authMiddleware))

        this.app.post('/auth/login', authController.login.bind(authController))

        this.app.post(
            '/deliverers',
            delivererController.register.bind(delivererController)
        )

        this.app.get(
            '/deliverers',
            delivererController.paginate.bind(delivererController)
        )

        this.app.post(
            '/deliverers/attach',
            upload.single('file'),
            delivererController.attachLicenseImage.bind(delivererController)
        )

        this.app.post(
            '/motorcycles',
            motorcycleController.store.bind(motorcycleController)
        )

        this.app.get(
            '/motorcycles',
            motorcycleController.paginate.bind(motorcycleController)
        )

        this.app.patch(
            '/motorcycles/:plate',
            motorcycleController.updatePlate.bind(motorcycleController)
        )

        this.app.delete(
            '/motorcycles/:plate',
            motorcycleController.delete.bind(motorcycleController)
        )

        this.app.post('/rents', rentController.rent.bind(rentController))
        this.app.get('/rents', rentController.paginate.bind(rentController))
    }

    private setupErrorHandling(): void {
        this.app.use(ErrorHandlingMiddleware())
    }

    public async start() {
        await new MongoConnectionManager().initialize()

        const port = process.env.PORT || 3000

        this.app.listen(port, () => {
            logger.info(`API Server listening on port ${port}`)
        })
    }
}
