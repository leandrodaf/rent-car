import { S3ClientConfig } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()

export enum EnvironmentType {
    LOCAL = 'local',
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    TEST = 'test',
}

interface DatabaseConfig {
    mongodb: {
        uri: string
    }
}

interface AuthConfig {
    jwt: {
        expiresIn: number
        secret: string
    }
}

interface AWSConfig {
    s3: S3ClientConfig
}

interface StorageConfig {
    s3: {
        bucketName: string
    }
}

interface KafkaConfig {
    clientId: string
    brokers: string[]
    groupId: string
    topics: {
        topic: string
        numPartitions: number
        replicationFactor: number
    }[]
}

function getValidEnvironment(env: string | undefined): EnvironmentType {
    if (
        env &&
        Object.values(EnvironmentType).includes(env as EnvironmentType)
    ) {
        return env as EnvironmentType
    }
    return EnvironmentType.LOCAL
}

interface AppConfig {
    kafka: KafkaConfig
    environment: EnvironmentType
    port: string | undefined
    database: DatabaseConfig
    auth: AuthConfig
    aws: AWSConfig
    storage: StorageConfig
}

const config: AppConfig = {
    environment: getValidEnvironment(process.env.NODE_ENV),
    port: process.env.PORT,

    auth: {
        jwt: {
            expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600,
            secret: process.env.JWT_SECRET || 'token-token',
        },
    },

    database: {
        mongodb: {
            uri: process.env.DB_URI || '',
        },
    },

    aws: {
        s3: {
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_S3_ACCESS_KEY || '',
                secretAccessKey: process.env.AWS_S3_SECRET_KEY || '',
            },
            endpoint: process.env.AWS_S3_ENDPOINT,
            forcePathStyle: true,
            tls: false,
        },
    },

    storage: {
        s3: {
            bucketName: 'example-bucket',
        },
    },

    kafka: {
        clientId: 'app',
        brokers: [process.env.KAFKA_HOST || 'localhost:9092'],
        groupId: 'rent-group',
        topics: [
            { topic: 'rent-create', numPartitions: 1, replicationFactor: 1 },
        ],
    },
}

export default config
