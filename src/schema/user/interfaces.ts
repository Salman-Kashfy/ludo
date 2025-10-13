import {GenderType, Status} from '../../database/entity/root/enums';

// the interface used while sending email to a User
export interface IUserEmailInput {
    email: string;
    password: string;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    userType?: string;
}

export interface UserFilter {
    searchText?: string;
    status: Status;
    roleId?: string;
    companyId: number;
}

export interface InviteParams {
    password: string
    inviteLink: string
}

export interface DashboardStatsInput {
    start: Date
    end: Date
}