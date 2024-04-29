import { Upload } from '@aws-sdk/lib-storage'
import {
    DeleteObjectCommand,
    S3Client as InternalAWSS3,
} from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import logger from '../../utils/logger'
import config from '../../config'
import { IStorage } from './IStorage'

export class S3Client implements IStorage {
    private s3Client: InternalAWSS3

    constructor() {
        this.s3Client = new InternalAWSS3(config.aws.s3)
        logger.info('S3 Client initialized.')
    }

    async uploadFile(
        Bucket: string,
        Key: string,
        Body: Readable | Buffer,
        ContentType: string
    ): Promise<void> {
        logger.info(`Starting file upload to S3`, {
            Bucket,
            Key,
            ContentType,
        })

        try {
            const upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket,
                    Key,
                    Body,
                    ContentType,
                },
            })

            upload.on('httpUploadProgress', (progress) => {
                logger.info(`Upload progress`, {
                    Bucket,
                    Key,
                    progress: JSON.stringify(progress),
                })
            })

            await upload.done()
            logger.info(`File uploaded successfully to S3`, {
                Bucket,
                Key,
            })
        } catch (error) {
            logger.error(`Failed to upload file to S3`, {
                Bucket,
                Key,
                error,
            })
            throw error
        }
    }

    async deleteFile(Bucket: string, Key: string): Promise<void> {
        logger.info(`Starting file deletion from S3`, {
            Bucket,
            Key,
        })

        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket,
                    Key,
                })
            )
            logger.info(`File deleted successfully from S3`, {
                Bucket,
                Key,
            })
        } catch (error) {
            logger.error(`Failed to delete file from S3`, {
                Bucket,
                Key,
                error,
            })
            throw error
        }
    }
}
