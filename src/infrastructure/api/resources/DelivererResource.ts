import {
    DriverLicenseType,
    IDeliverer,
    IDelivererModel,
} from '../../../domain/Deliverer'
import { UserType } from '../../../domain/User'

export class DelivererResource implements Partial<IDeliverer> {
    driverLicenseImageURL: string | undefined
    password: string
    email: string
    cnpj: string
    birthDate: string
    driverLicenseNumber: string
    driverLicenseType: DriverLicenseType
    name: string
    userType: UserType

    constructor(deliverer: IDelivererModel) {
        this.name = deliverer.name
        this.userType = deliverer.userType
        this.driverLicenseImageURL = deliverer.driverLicenseImageURL
        this.email = deliverer.email
        this.cnpj = deliverer.cnpj
        this.birthDate = deliverer.birthDate
        this.driverLicenseNumber = deliverer.driverLicenseNumber
        this.driverLicenseType = deliverer.driverLicenseType
    }
}
