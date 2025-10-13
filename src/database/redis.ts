import Redis from 'ioredis';
import {redis as redisConfig, serviceName, nodeEnv} from '../shared/config';

class RedisClient {
    static options = {
        port: redisConfig.connection.port, // Redis port
        host: redisConfig.connection.host, // Redis host
        db: 0, // Defaults to 0
        connectTimeout: 5000,
        password: process.env.REDIS_PASSWORD
    };

    static client = redisConfig.enable ? new Redis(RedisClient.options) : null;

    static async get(key: string, params:any = null) {
        if (redisConfig.enable) {
            let res: any;
            try {
                res = await RedisClient.client?.get(key + `:${nodeEnv}`);
            } catch (error) {
                console.log('Error getting the cache', error);
                return null;
            }
            if (res && params && params.parse) {
                res = JSON.parse(res);
            }
            return res;
        }
        return null;
    }

    static async set(key: string, value: any, params: any) {
        if (redisConfig.enable) {
            try {
                await RedisClient.client?.set(
                    key + `:${nodeEnv}`,
                    value,
                    'EX',
                    params?.ex ? params.ex : redisConfig.defaultShortExpiryTimeInSec
                );
            } catch (error) {
                console.log('Error setting the cache', error);
            }
        }
    }

    static async delete(key: string) {
        if (redisConfig.enable) {
            let res: any;
            try {
                res = await RedisClient.client?.del(`${key}:${nodeEnv}`);
            } catch (error) {
                console.log('Error deleting the cache', error);
                return null;
            }
            return res;
        }
        return null;
    }

    static async deleteByPattern(keyPattern: string) {
        if (redisConfig.enable) {
            const stream = RedisClient.client?.scanStream({
                match: keyPattern,
            });
            stream?.on('data', async (data: any) => {
                if (data.length > 0) {
                    const pipeline = RedisClient.client?.pipeline();
                    data.forEach((key: string) => {
                        key = key.replace(serviceName + ':', '');
                        pipeline?.del(key);
                    });
                    await pipeline?.exec();
                }
            });
        }
    }

    static async sessionKey(context: any) {
        if (
            (context.auth?.roles?.includes('super admin')) ||
            context.auth.roles?.includes('dev team')
        ) {
            return 'all';
        }
        if (context.auth.customerId && !context.auth.adminId) {
            return 'all';
        }
        if (!context.auth.customerId && !context.auth.adminId) {
            return 'all';
        }
        let key = context.auth.adminId;
        if (Array.isArray(context.auth.brands) && context.auth.brands.length > 0) {
            key += '|' + context.auth.brands.join(',');
        }
        if (Array.isArray(context.auth.gyms) && context.auth.gyms.length > 0) {
            key += '|' + context.auth.gyms.join(',');
        }
        if (Array.isArray(context.auth.roles) && context.auth.roles.length > 0) {
            key += '|' + context.auth.roles.join(',');
        }
        return key;
    }
}

export default RedisClient;