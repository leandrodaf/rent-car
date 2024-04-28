import mongoose from 'mongoose'
import logger from '../../utils/logger'
import config from '../../config'
import { IConnectionManager } from './IConnectionManager'

export class MongoConnectionManager implements IConnectionManager {
    async initialize() {
        const mongodb = config.database.mongodb

        try {
            await mongoose.connect(mongodb.uri)
            logger.info('Successfully connected to MongoDB')
        } catch (error) {
            logger.error('Error connecting to MongoDB', error)
            throw error
        }
    }
}
