import BaseModel from '../baseModel';
import { RolePermission as RolePermissionEntity } from '../../database/entity/RolePermission';
import { createLoaders } from './loaders';
import { first } from 'lodash';

export default class Model extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;
    constructor(connection: any, context: any) {
        super(connection, connection.getRepository(RolePermissionEntity), context);
        this.loaders = createLoaders(this);
    }

    async checkPermissions(role:any, requiredPermissions: string[]) {
        role = role || {};
        requiredPermissions = (requiredPermissions ? requiredPermissions : []).concat(['all']);
        let cnt: any = await this.connection.manager.query(
            `
            SELECT count(*) AS cnt
            FROM roles_permissions rp
            INNER JOIN permissions p ON rp.permission_id = p.id
            INNER JOIN ROLES r ON rp.role_id = r.id
            WHERE p.status = 'ACTIVE' AND r.status = 'ACTIVE' AND lower(r.name) = lower('${role.name}')
                AND lower(p.name) IN (${requiredPermissions
                .join(',')
                .split(',')
                .map((word: string) => `'${word.trim()}'`)
                .join(',')})`
        );
        cnt = first(cnt);
        cnt = Number(cnt ? cnt.cnt : 0);
        return cnt > 0;
    }

    getPermissionsByRoleId(roleId: string): any {
        if (!roleId) return null;
        return this.loaders.getPermissionsByRoleId.load(roleId);
    }

    getRolesByPermissionId(permissionId: string): any {
        if (!permissionId) return null;
        return this.loaders.getRolesByPermissionId.load(permissionId);
    }
}