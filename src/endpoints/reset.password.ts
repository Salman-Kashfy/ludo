import {Request, Response} from "express";
import schema from '../shared/directives/loadSchema';
import Context from "../schema/context";
import connection from "../ormconfig";

export const createOtp = async (req:Request, res:Response) => {
    const ctx = Context.getInstance(connection,schema,req)
    if(!req.body.type || !req.body.channel || !req.body.identifier){
        return res.status(200).json({status: false, errorMessage: 'Missing params'})
    }
    const response = await ctx.otp.createOtp(req.body)
    return res.status(200).json(response)
}

export const verifyOtp = async (req:Request, res:Response) => {
    const ctx = Context.getInstance(connection,schema,req)
    if(!req.body.type || !req.body.channel || !req.body.identifier){
        return res.status(200).json({status: false, errorMessage: 'Missing params'})
    }
    const response = await ctx.otp.fetchValidOtp(req.body)
    return res.status(200).json(response)
}

export const resetPassword = async (req:Request, res:Response) => {
    const ctx = Context.getInstance(connection,schema,req)
    if(!req.body.type || !req.body.channel || !req.body.identifier || !req.body.password){
        return res.status(200).json({status: false, errorMessage: 'Missing params'})
    }
    const response = await ctx.otp.resetPassword(req.body)
    return res.status(200).json(response)
}

export const invite = async (req:Request, res:Response) => {
    const ctx = Context.getInstance(connection,schema,req)
    if(!req.body?.inviteLink || !req.body?.password){
        return res.status(200).json({status: false, errorMessage: 'Missing params'})
    }
    const response = await ctx.auth.invite(req.body)
    return res.status(200).json(response)
}

export const validateInvite = async (req: Request, res: Response) => {
    const ctx = Context.getInstance(connection, schema, req);
    const inviteLink = req.query.inviteLink
    if (!inviteLink) {
        return res.status(200).json({ status: false, errorMessage: 'Missing params' });
    }
    try{
        const admin = await ctx.auth.validateInvite(inviteLink as string);
        if(admin){
            return res.status(200).json({status: true, admin: {firstName:admin.firstName}})
        }else{
            return res.status(200).json({status: false});
        }
    }catch (e) {
        return res.status(200).json({status: false});
    }
};