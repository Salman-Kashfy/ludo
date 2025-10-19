import {ROLES} from "../../shared/config";

export const roles = () => [
    {
        id: ROLES.ADMIN.ID,
        name: ROLES.ADMIN.NAME,
        displayName: ROLES.ADMIN.DISPLAY_NAME,
        status: 'ACTIVE',
    },
    {
        id: ROLES.EMPLOYEE.ID,
        name: ROLES.EMPLOYEE.NAME,
        displayName: ROLES.EMPLOYEE.DISPLAY_NAME,
        status: 'ACTIVE',
    }
]