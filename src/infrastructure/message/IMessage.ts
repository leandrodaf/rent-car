export interface IMessageProducer {
    sendMessage(topic: string, messages: { value: string }[]): Promise<void>
}

export interface IMessageConsumer {
    consumeMessage<T>(
        topic: string,
        callback: (payload: T) => Promise<void>
    ): Promise<void>
}

export interface IMessage extends IMessageProducer, IMessageConsumer {}
