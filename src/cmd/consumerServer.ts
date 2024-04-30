import { EachMessagePayload } from 'kafkajs'
import { rentContainer } from '../config/inversify.config'
import { TYPES } from '../config/types'
import KafkaConnectionManager from '../infrastructure/database/KafkaConnectionManager'
import { MongoConnectionManager } from '../infrastructure/database/MongoConnectionManager'
import { KafkaAdapter } from '../infrastructure/message/KafkaMessage'
import { ICMD } from './ICMD'
import { RentService } from '../application/RentService'

export class ConsumerServer implements ICMD {
    async start() {
        await new MongoConnectionManager().initialize()
        await KafkaConnectionManager.initialize<void>('producer')
        await KafkaConnectionManager.initialize<void>('consumer')

        const Kafka = rentContainer.get<KafkaAdapter>(TYPES.Message)
        const rentService = rentContainer.get<RentService>(TYPES.RentService)

        Kafka.consumeMessage(
            'rent-create',
            async (payload: EachMessagePayload) => {
                if (payload.message.value) {
                    await rentService.processRentCreated(
                        payload.message.value.toString()
                    )
                }
            }
        )
    }
}
