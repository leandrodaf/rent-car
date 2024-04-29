/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import prompts, { PromptObject } from 'prompts'
import { AdminUserCreator } from '../infrastructure/commands/AdminUserCreator'
import { UserService } from '../application/UserService'
import logger from '../utils/logger'
import { UserRepository } from '../infrastructure/repository/UserRepository'
import { MongoConnectionManager } from '../infrastructure/database/MongoConnectionManager'

export interface ICommand {
    execute(): Promise<void>
}

export class Commands {
    private commands: Record<string, ICommand>

    constructor() {
        const userRepository = new UserRepository()

        const userService = new UserService(userRepository)

        this.commands = {
            createAdmin: new AdminUserCreator(userService),
            exit: {
                execute: () => {
                    logger.info('Exiting...')
                    process.exit(0)
                },
            },
        }
    }

    async start(): Promise<void> {
        await new MongoConnectionManager().initialize()

        const mainMenu: PromptObject = {
            type: 'select',
            name: 'command',
            message: 'Choose a command to execute:',
            choices: Object.keys(this.commands).map((key) => ({
                title: this.formatTitle(key),
                value: key,
            })),
        }

        try {
            const { command } = await prompts(mainMenu)

            if (this.commands[command]) {
                await this.commands[command].execute()
            } else {
                logger.info('No valid command selected.')
                process.exit(1)
            }
        } catch (error) {
            logger.error('An error occurred during command execution:', error)
            process.exit(1)
        }
    }

    private formatTitle(commandKey: string): string {
        return commandKey.replace(/([A-Z])/g, ' $1').trim()
    }
}
