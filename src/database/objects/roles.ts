import {ROLES} from "../../shared/config";

export const roles = () => [
    {
        id: ROLES.SUPER_ADMIN.ID,
        name: ROLES.SUPER_ADMIN.NAME,
        displayName: ROLES.SUPER_ADMIN.DISPLAY_NAME,
        status: 'ACTIVE',
    },
    {
        id: ROLES.ADMIN.ID,
        name: ROLES.ADMIN.NAME,
        displayName: ROLES.ADMIN.DISPLAY_NAME,
        status: 'ACTIVE',
    },
    {
        id: ROLES.HR_ADMIN.ID,
        name: ROLES.HR_ADMIN.NAME,
        displayName: ROLES.HR_ADMIN.DISPLAY_NAME,
        status: 'ACTIVE',
    },
    {
        id: ROLES.MANAGER.ID,
        name: ROLES.MANAGER.NAME,
        displayName: ROLES.MANAGER.DISPLAY_NAME,
        status: 'ACTIVE',
    },
    {
        id: ROLES.EMPLOYEE.ID,
        name: ROLES.EMPLOYEE.NAME,
        displayName: ROLES.EMPLOYEE.DISPLAY_NAME,
        status: 'ACTIVE',
    }
]