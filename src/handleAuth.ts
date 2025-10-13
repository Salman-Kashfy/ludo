import { verify, TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import {jwtConfig} from "./shared/config";
import {AuthenticationError} from 'apollo-server-express';
import RedisClient from "./database/redis";
import connection from "./ormconfig";
import {User as UserEntity} from "./database/entity/User";
import {Status} from "./database/entity/root/enums";

const handleAuth = async ({req}: any) => {
    const authorization = req.header('Authorization');
    try {
        if (authorization) {
            const token = authorization.replace('Bearer ', '')
            let user:any = verify(token, jwtConfig.jwtSecretKey)
            if(user.key){
                const value = await RedisClient.get('token:'+user.key)
                if(value === token){
                    throw new AuthenticationError('Token blacklisted.');
                }
            }
            user = await connection.getRepository(UserEntity).findOne({
                relations: ['role'],
                where: { id:user.id }
            })
            if(user.status !== Status.ACTIVE){
                throw new AuthenticationError('Account deactivated.');
            }

            return { user, authorization };
        }else{
            throw new AuthenticationError('You must be logged in to access this resource.');
        }
    } catch (error:any) {
        if (error instanceof TokenExpiredError) {
            throw new AuthenticationError(error.message);
        }else if (error instanceof AuthenticationError) {
            throw new AuthenticationError(error.message);
        } else if (error instanceof JsonWebTokenError) {
            throw new AuthenticationError(error.message);
        } else {
            throw new Error(error.message);
        }
    }
};

export default handleAuth;
