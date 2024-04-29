import prompts, { PromptObject } from 'prompts'
import { z } from 'zod'
import { IUser, UserType } from '../../domain/User'

import logger from '../../utils/logger'
import { ICommand } from '../../cmd/commands'
import { IUserService } from '../../application/interfaces/IUserService'

export class AdminUserCreator implements ICommand {
    constructor(private readonly userService: IUserService) {}

    private nameSchema = z.string().min(1, 'The name cannot be empty.')
    private emailSchema = z.string().email('Invalid email format.')
    private passwordSchema = z
        .string()
        .min(6, 'The password must be at least 6 characters long.')

    private questions: PromptObject[] = [
        {
            type: 'text',
            name: 'name',
            message: "Enter the administrator's name:",
            validate: (input: string) =>
                this.nameSchema.safeParse(input).success ||
                'The name cannot be empty.',
        },
        {
            type: 'text',
            name: 'email',
            message: "Enter the administrator's e-mail address:",
            validate: (input: string) =>
                this.emailSchema.safeParse(input).success ||
                'The e-mail must not be empty or invalid.',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter the password:',
            validate: (input: string) =>
                this.passwordSchema.safeParse(input).success ||
                'The password must be at least 6 characters long.',
        },
        {
            type: 'password',
            name: 'passwordConfirm',
            message: 'Confirm the password:',
            validate: (input: string) =>
                this.passwordSchema.safeParse(input).success ||
                'The password must be at least 6 characters long.',
        },
    ]

    async execute(): Promise<void> {
        try {
            const answers = await prompts(this.questions)

            if (answers.password !== answers.passwordConfirm) {
                throw new Error("The passwords don't match.")
            }

            const data: IUser = {
                name: answers.name as string,
                email: answers.email as string,
                password: answers.password as string,
                userType: UserType.ADMIN,
            }

            await this.userService.create(data)

            logger.info('Administrator user created successfully!')
            process.exit(0)
        } catch (error) {
            logger.error('Error creating administrator user', error)
            throw error
        }
    }
}
