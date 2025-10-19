import {ROLES,SEED_USERS} from "../../shared/config";

export const userRoles = () => {
    return [
        {
            userId: SEED_USERS.ADMIN.ID,
            roleId: ROLES.ADMIN.ID
        },
        {
            userId: SEED_USERS.EMPLOYEE.ID,
            roleId: ROLES.EMPLOYEE.ID
        }
    ];
};