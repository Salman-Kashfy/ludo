import BaseModel from '../baseModel';
import { Permission as PermissionEntity } from '../../database/entity/Permission';
import { createLoaders } from './loaders';
import { isEmpty } from 'lodash';
import { Raw } from 'typeorm';
import axios from 'axios';

export default class Permission extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: any) {
        super(connection, connection.getRepository(PermissionEntity), context);
        this.loaders = createLoaders(this);
    }

    getByName(name: string) {
        return this.repository.findOne({
            where: {name: Raw((alias) => `LOWER(${alias}) = '${name.toLowerCase()}'`)},
        });
    }

    async softSaveValidate(input: any) {
        if (input && input.id && input.status && input.name) {
            return true;
        }
        return false;
    }

    async save(input: any) {
        try {
            let model: any;
            if (await this.softSaveValidate(input)) {
                model = await this.repository.findOne({where: {id: input.id}});
                const transaction = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                    if (isEmpty(model)) {
                        model = new PermissionEntity();
                        model.id = input.id;
                    }
                    model.name = input.name;
                    model.status = input.status;
                    await transactionalEntityManager.save(model);
                });
                if (transaction && transaction.error && transaction.error.length > 0) {
                    throw {message: 'TRANSACTION_FAILED'};
                }
                return true;
            }
            return false;
        } catch (error: any) {
            return {errors: [error.message]};
        }
    }

    async loadPermissionsFromServer(
        idIndex: number,
        nameIndex: number,
        rolesIndex: number,
        link?: string
    ) {
        // get the csv file from cloud!
        let csvURL = null;
        if (link) {
            csvURL = link;
        }
        let countSuccess = 0,
            countSuccessRoles = 0;
        // this.context.auth.roles = ['super admin'];
        // check permissions
        if (this.context.auth.roles && this.context.auth.roles.includes('super admin')) {
            if (csvURL) {
                try {
                    // get the data and save it
                    const res = await axios.get(csvURL, { responseType: 'blob' });
                    const file = res.data;
                    if (res.status === 200) {
                        const permissionsList = file.split('\r\n').map((item: any) => item.split(','));
                        const rolePermissions: any = {};
                        let i = 0;
                        for (let iPermission = 1; iPermission < permissionsList.length; iPermission++) {
                            const permissionItem: any = permissionsList[iPermission];
                            i++;
                            // add permission
                            const permission: any = new PermissionEntity();
                            if (idIndex >= 0) permission.id = permissionItem[idIndex];
                            if (nameIndex >= 0) permission.name = permissionItem[nameIndex];
                            permission.status = 'ACTIVE';
                            let resultPermission = await this.getByName(permission.name);
                            if (!resultPermission) {
                                const resSavePermission:any = await this.save(permission);
                                if ('permission' in resSavePermission) {
                                    resultPermission = resSavePermission.permission;
                                }
                            }

                            if (resultPermission?.errors && resultPermission.errors.length > 0) {
                                console.log(
                                    'Error loadPermissionsFromServer -> while saving the permission : ',
                                    resultPermission.errors
                                );
                            } else {
                                countSuccess++;
                            }

                            if (resultPermission && rolesIndex >= 0) {
                                const strRoles = permissionItem[rolesIndex].split('|');
                                // get roles, and save role/permission relation
                                for (let iRole = 0; iRole < strRoles.length; iRole++) {
                                    if (strRoles[iRole].length > 3) {
                                        const role = strRoles[iRole];
                                        let tmpRole = await this.context.role.getByName(role);

                                        // insert roles if not exists
                                        if (!tmpRole) {
                                            tmpRole = (
                                                await this.context.role.save({
                                                    name: role,
                                                    roleType: 'SAAS',
                                                    status: 'ACTIVE',
                                                })
                                            ).role;
                                            countSuccessRoles++;
                                        }
                                        if (tmpRole) {
                                            // create role/permission
                                            if (tmpRole.id in rolePermissions) {
                                                rolePermissions[tmpRole.id].permissions.push(resultPermission.id);
                                            } else {
                                                rolePermissions[tmpRole.id] = {
                                                    id: tmpRole.id,
                                                    name: tmpRole.name,
                                                    roleType: 'SAAS',
                                                    description: tmpRole.description,
                                                    status: tmpRole.status,
                                                    permissions: [resultPermission.id],
                                                };
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        console.log(`${countSuccess} / ${permissionsList.length} permissions added successfully !`);
                        console.log(`${countSuccessRoles} roles added successfully !`);
                        // console.log('rolePermissions : ', rolePermissions);
                        // update roles
                        for (const [roleId, data] of Object.entries(rolePermissions)) {
                            await this.context.role.save(data);
                        }
                        // await this.context.redis.deletebyPattern(`${serviceName}:checkPermissions:*`);
                        // await this.context.redis.deletebyPattern(`${serviceName}:getPermissionsByRoleNames:*`);
                        return true;
                    } else {
                        console.log(`Error loadPermissionsFromServer -> code ${res.status}`);
                    }
                } catch (error: any) {
                    console.log('Error loadPermissionsFromServer : ', error);
                }
            } else {
                console.log('Loading permissions failed : FILE_URL_PERMISSIONS Not configured !');
            }
        } else {
            console.log('Loading permissions failed : You are not as super admin !');
        }
        return false;
    }
}
