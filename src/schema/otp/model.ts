import BaseModel from '../baseModel';
import { Otp as OtpEntity } from '../../database/entity/Otp';
import { MoreThanOrEqual } from 'typeorm';
import * as crypto from 'crypto';
import {CreateOtpInput, FetchOtpInput, MarkOtpInput, ResetPasswordInput} from "./interface";
import {OtpError} from "./enum";
import {APP_LOGO, OTP_EXPIRY_IN_MINS} from "../../shared/config";
import moment from "moment";
import {isValidPassword, sendEmail} from "../../shared/lib/util";
import {hash} from "bcrypt";
import {User} from "../../database/entity/User";

export default class Otp extends BaseModel {
    repository: any;

    constructor(connection: any, context: any) {
        super(connection, connection.getRepository(OtpEntity), context);
    }

    /**
     * Create a new OTP code
     */
    async createOtp(input:CreateOtpInput) {
        const { channel, type, identifier } = input;
        const user:User = await this.context.auth.repository.findOne({
            where: {email:identifier}
        })
        if(!user){
            return this.formatErrors([OtpError.NOT_FOUND],'Unrecognized email.')
        }

        /**
        * Abuse prevention: max 3 OTPs per minute per channel
        * */
        const oneMinuteAgo = moment().subtract(1, 'minute').utc()
        const recentCount = await this.repository.count({
            where: {
                identifier,
                channel,
                type,
                createdAt: MoreThanOrEqual(oneMinuteAgo),
            },
        })

        if (recentCount >= 3) {
            return this.formatErrors([OtpError.TOO_MANY_REQUESTS],'Too many OTP requests. Please try again later.')
        }

        const code = crypto.randomInt(10000, 99999).toString();

        /**
        * Delete previous related OTPs
        * */
        await this.markOtpAsUsed(input)

        /**
         * Generate new OTP
         * */
        const otp = this.repository.create({identifier,
            code, type, channel,
            userId: user.id,
            expiresAt: new Date(Date.now() + OTP_EXPIRY_IN_MINS * 60000),
        });

        await this.repository.save(otp)
        await sendEmail({
            to: user.email,
            subject: 'Reset Password OTP',
            template: 'reset.password',
            logo: APP_LOGO,
            data: {
                code,
                firstName: user.firstName,
                expireMins: OTP_EXPIRY_IN_MINS
            }
        })
        return this.successResponse({})
    }

    /**
     * Fetch a valid (non-expired, unused) OTP
     */
    async fetchValidOtp(input:FetchOtpInput) {
        const { code, type, channel, identifier } = input;
        const now = new Date();

        const otp = await this.repository.findOne({
            where: {
                code,
                type,
                channel,
                identifier,
                isUsed: false,
                expiresAt: MoreThanOrEqual(now),
            },
        });

        if (!otp) {
            return this.formatErrors([OtpError.INVALID_OTP],'Invalid or expired OTP')
        }

        return this.successResponse({userId: otp.userId})
    }

    /**
     * Reset Password
     */
    async resetPassword(input:ResetPasswordInput) {
        const otp:any = await this.fetchValidOtp(input)
        if (!otp.status) {
            return this.formatErrors([OtpError.INVALID_OTP],otp.errorMessage)
        }
        if(!isValidPassword(input.password)){
            return this.formatErrors([OtpError.WEAK_PASSWORD],'Password must have at least one uppercase letter, one lowercase letter, one number, and one special character')
        }
        const user = await this.context.auth.repository.findOneBy({id: otp.data.userId})
        user.password = await hash(input.password, 10)
        await Promise.all([user.save(), this.markOtpAsUsed(input)])
        return this.successResponse({})
    }

    /**
     * Mark OTP as used
     */
    async markOtpAsUsed(input: MarkOtpInput) {
        const { type, channel, identifier } = input
        await this.repository.delete(
            { type, channel, identifier }
        )
    }
}
