import {OtpChannel, OtpType} from "./enum";

export interface CreateOtpInput {
    type: OtpType;
    channel: OtpChannel;
    identifier: string
}

export interface FetchOtpInput {
    code: string;
    type: OtpType;
    channel: OtpChannel;
    identifier: string
}

export interface MarkOtpInput {
    type: OtpType;
    channel: OtpChannel;
    identifier: string
}

export interface ResetPasswordInput {
    code: string;
    type: OtpType;
    channel: OtpChannel;
    identifier: string
    password: string
}