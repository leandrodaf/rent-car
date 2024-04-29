import { isCNH, isCNPJ } from 'validation-br'
import { z } from 'zod'

export const DelivererQuery = z.object({
    cnpj: z
        .string()
        .transform((val) => val.replace(/[^\d]/g, ''))
        .optional()
        .refine((val) => !val || isCNPJ(val), {
            message: 'Invalid CNPJ',
        }),
    driverLicenseNumber: z
        .string()
        .transform((val) => val.replace(/[^\d]/g, ''))
        .optional()
        .refine((val) => !val || isCNH(val), {
            message: 'Invalid driver license number',
        }),
})
