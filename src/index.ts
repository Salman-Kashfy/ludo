import express, {Request, Response} from "express";
import cookieParser from 'cookie-parser'
import {ApolloServer, Config, ExpressContext} from 'apollo-server-express';
import schema from './shared/directives/loadSchema';
import connection from "./database/connection";
import { userLogin, userLogout, refreshToken, userPermissions } from "./endpoints/user";
import { createOtp, verifyOtp, invite, validateInvite, resetPassword } from "./endpoints/reset.password";
import {basePath, disableAuthAccess, disableGraphqlIntrospection, getFakeAuth, NODE_ENV} from './shared/config'
import { config }  from "dotenv"
import Context from "./schema/context";
import handleAuth from "./handleAuth";
import bodyParser from 'body-parser';
import {Auth} from './middleware/auth'
import cors from 'cors'
import https from 'https'
import fs from 'fs'

/**
 * Setup application config and environment variables.
 * */
config()
const app:any = express()
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

/**
* Configure cors. Whitelist origins for storing http only cookie on client-side.
* */
const allowedOrigins = ['https://app.cloudfitnest.com','https://dev.cloudfitnest.com','https://studio.apollographql.com','https://localhost','https://localhost:4000'];
const corsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));
const port = process.env.NODE_PORT || 8080;
const prefix = 'api';

/**
* Setup context with auth
* */
let authContext:any
const setupAuthContext = async (connection: any, schema: any, req: any) => {
    let auth
    if (disableAuthAccess) {
        auth = getFakeAuth()
    }else{
        const { user }: any = await handleAuth({ req });
        auth = user
    }
    if(!authContext){
        authContext =  Context.getInstance(connection, schema, req, auth);
    }
    return authContext
};

/**
 * Setup context without auth
 * */
export const setupWithoutAuthContext = (connection: any, schema: any) => {
    return new Context(connection, schema);
};

declare module 'express' {
    export interface Request {
        user?: any;
        file_uploaded?: any;
    }
}

(async () => {
    await connection.initialize();
    const ctx:Context = setupWithoutAuthContext(connection,schema)

    try{
        /**
         * Application routes
         * */
        app.get(`/${prefix}/health`, async (req:Request,res:Response) => {
            res.json({ message: 'Kudos!' })
            return
        })
        app.post(`/${prefix}/login`, userLogin)
        app.post(`/${prefix}/logout`, userLogout)
        app.get(`/${prefix}/user-permissions`, Auth, userPermissions)
        app.post(`/${prefix}/refresh-token`, refreshToken)
        app.post(`/${prefix}/create-otp`, createOtp)
        app.post(`/${prefix}/verify-otp`, verifyOtp)
        app.post(`/${prefix}/reset-password`, resetPassword)
        app.post(`/${prefix}/invite`, invite)
        app.get(`/${prefix}/validate-invite`, validateInvite)

        /**
         * Provide schema and resolvers to apollo server instance.
         * */
        const server = new ApolloServer({
            schema,
            introspection: !disableGraphqlIntrospection,
            async context({ req }) {
                if(authContext){
                    const { user }: any = await handleAuth({ req });
                    authContext.setReq(req)
                    authContext.setAuth(user)
                }
                const ctx = authContext || await setupAuthContext(connection, schema, req);
                ctx.req = req;
                return ctx;
            },
        } as Config<ExpressContext>)

        /**
        * Kickoff apollo and express server.
        * */
        await server.start();
        server.applyMiddleware({ app, path: '/graphql', cors: { origin: allowedOrigins, credentials: true } });
        if(process.env.NODE_HOST?.indexOf('https') !== -1 && process.env.NODE_ENV === NODE_ENV.local){
            const sslOptions = {
                key: fs.readFileSync(process.env.SSL_PRIVATE_KEY || '' ),
                cert: fs.readFileSync(process.env.SSL_CERTIFICATE || '' ),
            }
            https.createServer(sslOptions, app).listen(port , () => console.log(`Https server ready at ${basePath}`))
        }else{
            app.listen(port , () => console.log(`Server ready at ${basePath}`))
        }

    }catch (e) {
        console.log(e)
    }
})()