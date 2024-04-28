import express from 'express'
import { ICMD } from './ICMD'
import { UserRepository } from '../infrastructure/repository/UserRepository'
import { AuthService } from '../application/UserService'
import { AuthController } from '../infrastructure/api/AuthController'
import { MongoConnectionManager } from '../infrastructure/database/MongoConnectionManager'

export class APIServer implements ICMD {
    private app: express.Application

    constructor() {
        this.app = express()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.app.use(express.json())
    }

    public async start() {
        new MongoConnectionManager().initialize()

        const port = process.env.PORT || 3000

        this.app.listen(port, () => {
            console.log(`API Server listening on port ${port}`)
        })
    }
}
