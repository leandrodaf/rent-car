/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import prompts from 'prompts'
import { APIServer } from './cmd/apiServer'
import { ConsumerServer } from './cmd/consumerServer'
import logger from './utils/logger'
import { Commands } from './cmd/commands'

async function chooseServerInteractively() {
    const response = await prompts({
        type: 'select',
        name: 'choice',
        message: 'What do you want to start?',
        choices: [
            { title: 'API Server', value: 'api' },
            { title: 'Consumer Server', value: 'consumer' },
            { title: 'App commands', value: 'commands' },
        ],
        initial: 0,
    })

    return response.choice
}

function startServer(serverType: string) {
    switch (serverType) {
        case 'api':
            logger.info('Starting API Server...')
            new APIServer().start()
            break
        case 'consumer':
            logger.info('Starting Consumer Server...')
            new ConsumerServer().start()
            break
        case 'commands':
            logger.info('Starting the application commands...')
            new Commands().start()
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
