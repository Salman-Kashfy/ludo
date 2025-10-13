import DataLoader from 'dataloader';
import { map } from 'lodash';
import { In } from 'typeorm';

export const createLoaders = (model: any) => {
    return {
        getPermissionsByRoleId: new DataLoader(async (ids: any) => {
            const items = await model.repository.find({
                join: {
                    alias: 'rolePermission',
                    innerJoinAndSelect: {
                        permissionId: 'rolePermission.permission',
                    },
                },
                where: { roleId: In(ids) },
            });
            return map(ids, (id) =>
                map(
                    items.filter((item: { roleId: string }) => item.roleId === id),
                    (node) => node.permission
                )
            );
        }),
        getRolesByPermissionId: new DataLoader(async (ids: any) => {
            const items = await model.repository.find({
                join: {
                    alias: 'rolePermission',
                    innerJoinAndSelect: {
                        roleId: 'rolePermission.role',
                    },
                },
                where: { permissionId: In(ids) },
            });
            return map(ids, (id) =>
                map(
                    items.filter((item: { permissionId: string }) => item.permissionId === id),
                    (node) => node.role
                )
            );
        }),
    };
};
