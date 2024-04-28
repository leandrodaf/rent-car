import express from 'express'
import { ICMD } from './ICMD'

export class APIServer implements ICMD {
    private app: express.Application

    constructor() {
        this.app = express()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.app.use(express.json())
    }

    public start(): void {
        const port = process.env.PORT || 3000
        this.app.listen(port, () => {
            console.log(`API Server listening on port ${port}`)
        })
    }
}
