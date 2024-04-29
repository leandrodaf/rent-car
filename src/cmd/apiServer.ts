import express from 'express'
import { ICMD } from './ICMD'
import { UserRepository } from '../infrastructure/repository/UserRepository'
import { AuthService } from '../application/UserService'
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

        const authService = new AuthService(userRepository)
        const delivererService = new DelivererService(
            delivererRepository,
            storage
        )

        const motorcycleService = new MotorcycleService(motorcycleRespository)

        const authController = new AuthController(authService)

        const delivererController = new DelivererController(delivererService)
        const motorcycleController = new MotorcycleController(motorcycleService)

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
    }

    private setupErrorHandling(): void {
        this.app.use(ErrorHandlingMiddleware())
    }

    public async start() {
        await new MongoConnectionManager().initialize()

        const port = process.env.PORT || 3000

        this.app.listen(port, () => {
            console.log(`API Server listening on port ${port}`)
        })
    }
}
