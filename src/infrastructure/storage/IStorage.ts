import { Readable } from 'stream'

export interface IStorage {
    uploadFile(
        Bucket: string,
        Key: string,
        Body: Readable | Buffer,
        ContentType: string
    ): Promise<void>

    deleteFile(Bucket: string, Key: string): Promise<void>
}
