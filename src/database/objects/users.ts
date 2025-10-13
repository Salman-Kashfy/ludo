import {GenderType, Status} from "../entity/root/enums";
import {ROLES, SEED_USERS} from "../../shared/config";

interface UserInput {
    passwordHash:string
    countryId:number
    companyId?:number
}

export const users = async (input:UserInput) => [
    {
        id: SEED_USERS.SUPER_ADMIN.ID,
        roleId: ROLES.SUPER_ADMIN.ID,
        firstName: SEED_USERS.SUPER_ADMIN.NAME,
        lastName: '',
        gender: GenderType.MALE,
        email: 'support@corefluence.com',
        password: input.passwordHash,
        countryId: input.countryId,
        companyId: undefined, // Super admin has no company
        phoneCode: '92',
        phoneNumber: '3322278636',
        status: Status.ACTIVE,
        createdById: SEED_USERS.SUPER_ADMIN.ID,
        lastUpdatedById: SEED_USERS.SUPER_ADMIN.ID,
        isSysAdmin: true
    },
    {
        id: SEED_USERS.ADMIN.ID,
        roleId: ROLES.ADMIN.ID,
        firstName: SEED_USERS.ADMIN.NAME,
        lastName: '',
        gender: GenderType.MALE,
        email: 'salman@corefluence.com',
        password: input.passwordHash,
        countryId: input.countryId,
        companyId: input.companyId,
        phoneCode: '92',
        phoneNumber: '3332258331',
        status: Status.ACTIVE,
        createdById: SEED_USERS.SUPER_ADMIN.ID,
        lastUpdatedById: SEED_USERS.SUPER_ADMIN.ID,
    },
    {
        id: SEED_USERS.HR_ADMIN.ID,
        roleId: ROLES.HR_ADMIN.ID,
        firstName: SEED_USERS.HR_ADMIN.NAME,
        lastName: '',
        gender: GenderType.FEMALE,
        email: 'manahil@corefluence.com',
        password: input.passwordHash,
        countryId: input.countryId,
        companyId: input.companyId,
        phoneCode: '92',
        phoneNumber: '3360813343',
        status: Status.ACTIVE,
        createdById: SEED_USERS.SUPER_ADMIN.ID,
        lastUpdatedById: SEED_USERS.SUPER_ADMIN.ID,
    },
    {
        id: SEED_USERS.MANAGER.ID,
        roleId: ROLES.MANAGER.ID,
        firstName: SEED_USERS.MANAGER.NAME,
        lastName: '',
        gender: GenderType.FEMALE,
        email: 'shahzain@corefluence.com',
        password: input.passwordHash,
        countryId: input.countryId,
        companyId: input.companyId,
        phoneCode: '92',
        phoneNumber: '3310343343',
        status: Status.ACTIVE,
        createdById: SEED_USERS.SUPER_ADMIN.ID,
        lastUpdatedById: SEED_USERS.SUPER_ADMIN.ID,
    },
    {
        id: SEED_USERS.EMPLOYEE.ID,
        roleId: ROLES.EMPLOYEE.ID,
        firstName: SEED_USERS.EMPLOYEE.NAME,
        lastName: '',
        gender: GenderType.MALE,
        email: 'max@corefluence.com',
        password: input.passwordHash,
        countryId: input.countryId,
        companyId: input.companyId,
        phoneCode: '92',
        phoneNumber: '3320001234',
        status: Status.ACTIVE,
        createdById: SEED_USERS.SUPER_ADMIN.ID,
        lastUpdatedById: SEED_USERS.SUPER_ADMIN.ID,
    },
]