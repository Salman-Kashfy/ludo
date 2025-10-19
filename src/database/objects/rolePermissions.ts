import {ROLES} from "../../shared/config";
import {PERMISSIONS} from "../../shared/permissions";
import {ADMIN_PERMISSIONS} from "../../shared/permissions/admin";
import {EMPLOYEE_PERMISSIONS} from "../../shared/permissions/employee";

const _rolePermissions = [
    {
        roleId: ROLES.ADMIN.ID,
        permissionId: PERMISSIONS.ALL.ID,
    }
]

for (const permissionId of ADMIN_PERMISSIONS) {
    _rolePermissions.push({roleId: ROLES.ADMIN.ID, permissionId})
}

for (const permissionId of EMPLOYEE_PERMISSIONS) {
    _rolePermissions.push({roleId: ROLES.EMPLOYEE.ID, permissionId})
}

export const rolePermissions = () => _rolePermissions