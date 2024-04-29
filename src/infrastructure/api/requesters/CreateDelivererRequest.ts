import { z } from 'zod'
import { isCNH, isCNPJ } from 'validation-br'
import { UserType } from '../../../domain/User'
import { calculateAge } from '../../../utils/validators/calculateAge'
import { DriverLicenseType } from '../../../domain/Deliverer'

export const CreateDelivererRequest = z.object({
    driverLicenseImageURL: z.string().optional(),
    userType: z.literal(UserType.DELIVERER),
    email: z.string().email(),
    password: z.string(),
    passwordConfirmation: z.string(),
    name: z.string(),
    cnpj: z
        .string()
        .transform((val) => val.replace(/[^\d]/g, ''))
        .refine((val) => isCNPJ(val), { message: 'Invalid CNPJ' }),
    birthDate: z.string().refine((birthDate) => calculateAge(birthDate, 18), {
        message: 'Must be at least 18 years old',
    }),

    driverLicenseNumber: z
        .string()
        .transform((val) => val.replace(/[^\d]/g, ''))
        .refine((val) => isCNH(val), {
            message: 'Invalid driver license number',
        }),
    driverLicenseType: z.nativeEnum(DriverLicenseType),
})

export type CreateDelivererRequestType = z.infer<typeof CreateDelivererRequest>
