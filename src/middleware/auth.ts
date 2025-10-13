import { Request, Response, NextFunction } from "express";
import handleAuth from "../handleAuth";
import {JsonWebTokenError, TokenExpiredError} from "jsonwebtoken";
import {AuthenticationError} from "apollo-server-express";

export const Auth = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const { user }: any = await handleAuth({ req });
        req.user = user;
        next();
    }catch (error:any) {
        if (
            error instanceof TokenExpiredError ||
            error instanceof AuthenticationError ||
            error instanceof JsonWebTokenError
        ) {
            return res.status(401).json({ status: false, message: error.message });
        } else {
            throw new Error(error.message);
        }
    }

}