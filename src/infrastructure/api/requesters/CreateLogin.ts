import { z } from 'zod'

export const LoginRequest = z.object({
    email: z.string().email(),
    password: z.string(),
})

export type LoginRequestType = z.infer<typeof LoginRequest>
