import express, { Application, RequestHandler } from 'express'
import { ICMD } from './ICMD'
import { upload } from '../infrastructure/api/MulterUpload'
import { MongoConnectionManager } from '../infrastructure/database/MongoConnectionManager'
import { ErrorHandlingMiddleware } from '../infrastructure/api/middlewares/ErrorHandlingMiddleware'
import logger from '../utils/logger'
import { myContainer } from '../config/inversify.config'
import { TYPES } from '../config/types'
import { AuthMiddleware } from '../infrastructure/api/middlewares/AuthMiddleware'
import kafka from '../infrastructure/database/KafkaConnectionManager'

type ControllerMethods = {
    [action: string]: (...args: unknown[]) => unknown
}

export class APIServer implements ICMD {
    private app: express.Application

    constructor() {
        this.app = express()
        this.setupRoutes()
        this.setupErrorHandling()
    }

    private bindRoutes(
        controllerType: symbol,
        routes: Array<{
            method: 'get' | 'post' | 'patch' | 'delete'
            path: string
            action: string
            middlewares?: RequestHandler[]
        }>
    ) {
        const controller = myContainer.get<ControllerMethods>(controllerType)

        routes.forEach((route) => {
            const method: (
                path: string,
                ...handlers: RequestHandler[]
            ) => Application = this.app[route.method]

            const handlers = [
                ...(route.middlewares || []),
                controller[route.action].bind(controller),
            ]

            method.call(this.app, route.path, ...handlers)
        })
    }

    private setupRoutes(): void {
        this.app.use(express.json())

        // Middleware setup
        const authMiddleware = myContainer.get<AuthMiddleware>(
            TYPES.AuthMiddleware
        )
        this.app.use(authMiddleware.middleware.bind(authMiddleware))

        // Auth Routes
        this.bindRoutes(TYPES.AuthController, [
            { method: 'post', path: '/auth/login', action: 'login' },
        ])

        // Deliverer Routes
        this.bindRoutes(TYPES.DelivererController, [
            { method: 'post', path: '/deliverers', action: 'register' },
            { method: 'get', path: '/deliverers', action: 'paginate' },
            {
                method: 'post',
                path: '/deliverers/attach',
                action: 'attachLicenseImage',
                middlewares: [upload.single('file')],
            },
        ])

        // Motorcycle Routes
        this.bindRoutes(TYPES.MotorcycleController, [
            { method: 'post', path: '/motorcycles', action: 'store' },
            { method: 'get', path: '/motorcycles', action: 'paginate' },
            {
                method: 'patch',
                path: '/motorcycles/:plate',
                action: 'updatePlate',
            },
            { method: 'delete', path: '/motorcycles/:plate', action: 'delete' },
        ])

        // Rent Routes
        this.bindRoutes(TYPES.RentController, [
            { method: 'post', path: '/rents', action: 'rent' },
            { method: 'get', path: '/rents', action: 'paginate' },
            {
                method: 'post',
                path: '/rents/expected-return',
                action: 'expectedReturn',
            },
            {
                method: 'post',
                path: '/rents/finalize-return',
                action: 'finalizeRent',
            },
        ])
    }

    private setupErrorHandling(): void {
        this.app.use(ErrorHandlingMiddleware())
    }

    public async start() {
        await new MongoConnectionManager().initialize()
        await kafka.initialize<void>('producer')

        const port = process.env.PORT || 3000
        this.app.listen(port, () => {
            logger.info(`API Server listening on port ${port}`)
        })
    }
}
