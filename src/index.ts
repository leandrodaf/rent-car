import prompts from 'prompts'
import { APIServer } from './cmd/apiServer'
import { ConsumerServer } from './cmd/consumerServer'
import logger from './utils/logger'

async function chooseServerInteractively() {
    const response = await prompts({
        type: 'select',
        name: 'choice',
        message: 'What do you want to start?',
        choices: [
            { title: 'API Server', value: 'api' },
            { title: 'Consumer Server', value: 'consumer' },
        ],
        initial: 0,
    })

    return response.choice
}

function startServer(serverType: string) {
    switch (serverType) {
        case 'api':
            logger.info('Starting API Server...')
            const apiServer = new APIServer()
            apiServer.start()
            break
        case 'consumer':
            logger.info('Starting Consumer Server...')
            const consumerServer = new ConsumerServer()
            consumerServer.start()
            break
        default:
            logger.info('Invalid server type specified.')
            break
    }
}

async function main() {
    const serverType = process.argv[2]

    if (serverType) {
        startServer(serverType)
    } else {
        const choice = await chooseServerInteractively()
        startServer(choice)
    }
}

main()
