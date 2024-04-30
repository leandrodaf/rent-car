import { Consumer, Producer } from 'kafkajs'
import { IMessage } from './IMessage'
import { injectable } from 'inversify'
import logger from '../../utils/logger'
import kafkaManager from '../database/KafkaConnectionManager'

@injectable()
export class KafkaAdapter implements IMessage {
    private producer: Producer
    private consumer: Consumer

    constructor() {
        this.producer = kafkaManager.getProducer()
        this.consumer = kafkaManager.getConsumer()
    }

    async sendMessage(
        topic: string,
        messages: { value: string }[]
    ): Promise<void> {
        logger.info('Sending message to Kafka', {
            topic,
            messages,
        })

        try {
            await this.producer.send({
                topic,
                messages,
                acks: -1,
            })
            logger.info('Message sent successfully', { topic })
        } catch (error) {
            logger.error('Failed to send message', {
                topic,
                error,
            })
            throw error
        }
    }

    async consumeMessage<EachMessagePayload>(
        topic: string,
        callback: (payload: EachMessagePayload) => Promise<void>
    ): Promise<void> {
        try {
            await this.consumer.subscribe({ topic, fromBeginning: true })

            await this.consumer.run({
                eachMessage: async (payload) => {
                    logger.info('Consuming message from Kafka', {
                        topic,
                        partition: payload.partition,
                    })
                    try {
                        await callback(payload as unknown as EachMessagePayload)

                        logger.info('Message processed successfully', {
                            topic,
                            partition: payload.partition,
                        })
                    } catch (error) {
                        logger.error('Failed to process message', {
                            topic,
                            partition: payload.partition,
                            error,
                        })
                        throw error
                    }
                },
            })
        } catch (error) {
            logger.error('Failed to subscribe or run consumer', {
                topic,
                error,
            })
            throw error
        }
    }
}
