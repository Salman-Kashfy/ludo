import {GenderType, Status} from "../entity/root/enums";
import {ROLES, SEED_USERS} from "../../shared/config";

interface UserInput {
    passwordHash:string
    countryId:number
    companyId?:number
    companyUuid?:string
}

export const users = async (input:UserInput) => [
    {
        id: SEED_USERS.ADMIN.ID,
        roleId: ROLES.ADMIN.ID,
        firstName: SEED_USERS.ADMIN.NAME,
        lastName: '',
        gender: GenderType.MALE,
        email: 'admin@corefluence.com',
        password: input.passwordHash,
        countryId: input.countryId,
        companyId: input.companyId,
        companyUuid: input.companyUuid,
        phoneCode: '92',
        phoneNumber: '3332258331',
        status: Status.ACTIVE,
        createdById: SEED_USERS.ADMIN.ID,
        lastUpdatedById: SEED_USERS.ADMIN.ID,
        isSysAdmin: true
    },
    {
        id: SEED_USERS.EMPLOYEE.ID,
        roleId: ROLES.EMPLOYEE.ID,
        firstName: SEED_USERS.EMPLOYEE.NAME,
        lastName: '',
        gender: GenderType.MALE,
        email: 'employee@corefluence.com',
        password: input.passwordHash,
        countryId: input.countryId,
        companyId: input.companyId,
        companyUuid: input.companyUuid,
        phoneCode: '92',
        phoneNumber: '3320001234',
        status: Status.ACTIVE,
        createdById: SEED_USERS.ADMIN.ID,
        lastUpdatedById: SEED_USERS.ADMIN.ID,
    },
]