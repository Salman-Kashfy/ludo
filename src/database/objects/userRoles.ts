import {ROLES,SEED_USERS} from "../../shared/config";

export const userRoles = () => {
    return [
        {
            userId: SEED_USERS.SUPER_ADMIN.ID,
            roleId: ROLES.SUPER_ADMIN.ID
        },
        {
            userId: SEED_USERS.ADMIN.ID,
            roleId: ROLES.ADMIN.ID
        },
        {
            userId: SEED_USERS.HR_ADMIN.ID,
            roleId: ROLES.HR_ADMIN.ID
        },
        {
            userId: SEED_USERS.MANAGER.ID,
            roleId: ROLES.MANAGER.ID
        },
        {
            userId: SEED_USERS.EMPLOYEE.ID,
            roleId: ROLES.EMPLOYEE.ID
        }
    ];
};