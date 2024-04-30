import { Admin, Consumer, Kafka, Producer } from 'kafkajs'
import { Partitioners } from 'kafkajs'

import logger from '../../utils/logger'
import config from '../../config'
import { IConnectionManager } from './IConnectionManager'

class KafkaConnectionManager implements IConnectionManager {
    private kafka: Kafka
    private producer: Producer
    private consumer: Consumer
    private admin: Admin

    constructor() {
        this.kafka = new Kafka({
            clientId: config.kafka.clientId,
            brokers: config.kafka.brokers,
        })

        this.producer = this.kafka.producer({
            allowAutoTopicCreation: true,
            transactionTimeout: 30000,
            retry: {
                retries: Infinity,
                initialRetryTime: 300,
                maxRetryTime: 30000,
                factor: 0.2,
            },
            idempotent: true,
            createPartitioner: Partitioners.LegacyPartitioner,
        })

        this.consumer = this.kafka.consumer({
            groupId: config.kafka.groupId,
            sessionTimeout: 15000,
            heartbeatInterval: 3000,
            allowAutoTopicCreation: false,
            maxBytesPerPartition: 1048576, // 1 MB
            minBytes: 1,
            maxBytes: 10485760, // 10 MB
            maxWaitTimeInMs: 5000,
            retry: {
                retries: 5,
                initialRetryTime: 300,
                maxRetryTime: 30000,
                factor: 0.2,
                multiplier: 1.5,
            },
        })

        this.admin = this.kafka.admin()
    }

    async initialize<T>(type: 'producer' | 'consumer'): Promise<T> {
        if (type === 'producer') {
            return this.connectProducer() as Promise<T>
        }

        if (type === 'consumer') {
            return this.connectConsumer() as Promise<T>
        }

        throw new Error(`Invalid type: ${type as string}`)
    }

    public async connectProducer() {
        try {
            await this.producer.connect()
            logger.info('Producer connected to Kafka')
            await this.ensureTopics()
        } catch (error) {
            logger.error('Failed to connect producer to Kafka', error)
            throw error
        }
    }

    public async connectConsumer() {
        try {
            await this.consumer.connect()
            logger.info('Consumer connected to Kafka')
            await this.ensureTopics()
        } catch (error) {
            logger.error('Failed to connect consumer to Kafka', error)
            throw error
        }
    }

    getProducer(): Producer {
        return this.producer
    }

    getConsumer(): Consumer {
        return this.consumer
    }

    private async ensureTopics() {
        await this.admin.connect()

        const existingTopics = await this.admin.listTopics()
        const topicsNeeded = config.kafka.topics.filter(
            (t) => !existingTopics.includes(t.topic)
        )

        if (topicsNeeded.length > 0) {
            await this.admin.createTopics({
                topics: topicsNeeded,
                waitForLeaders: true,
            })
            logger.info(
                `Created topics: ${topicsNeeded.map((t) => t.topic).join(', ')}`
            )
        } else {
            logger.info('All topics are already created')
        }

        await this.admin.disconnect()
    }
}

const kafka = new KafkaConnectionManager()

export default kafka
