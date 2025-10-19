import BaseModel from '../baseModel';
import { Role as RoleEntity } from '../../database/entity/Role';
import { RolePermission as RolePermissionEntity } from '../../database/entity/RolePermission';
import { createLoaders } from './loaders';
import { map, isEmpty } from 'lodash';
import {Raw, In, Not} from 'typeorm';
import {RoleNames, Status} from "../../database/entity/root/enums";

export default class Role extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;
    constructor(connection: any, context: any) {
        super(connection, connection.getRepository(RoleEntity), context);
        this.loaders = createLoaders(this);
    }

    async index() {
        const list = await this.repository.find({
            where: { status: Status.ACTIVE }
        })
        return { list };
    }

    getByName(name: string) {
        return this.repository.findOne({
            where: { name: Raw((alias) => `LOWER(${alias}) = '${name.toLowerCase()}'`) },
        });
    }

    getByIds(ids: string[]) {
        if (!ids || (ids && ids.length === 0)) {
            return [];
        }
        return this.repository.find({ where: { id: In(ids) } });
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
                model = await this.repository.findOne({ where: { id: input.id } });
                const transaction = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                    if (isEmpty(model)) {
                        model = new RoleEntity();
                        model.id = input.id;
                    }

                    model.name = input.name;
                    model.status = input.status;
                    model.roleType = input.roleType;

                    await transactionalEntityManager.save(model);
                    const rolesPermissions = map(input.permissions, (permissionId: string) => {
                        return {
                            permissionId,
                            roleId: model.id,
                        };
                    });

                    await transactionalEntityManager
                        .createQueryBuilder()
                        .delete()
                        .from(RolePermissionEntity)
                        .where('role_id = :roleId', { roleId: model.id })
                        .execute();

                    /**
                    * Begin adding new ones from the table
                    * */
                    if (!isEmpty(rolesPermissions)) {
                        await transactionalEntityManager
                            .createQueryBuilder()
                            .insert()
                            .into(RolePermissionEntity)
                            .values(rolesPermissions)
                            .execute();
                    }
                });
                if (transaction && transaction.error && transaction.error.length > 0) {
                    throw { message: 'TRANSACTION_FAILED' };
                }
                return true;
            }

            return false;
        } catch (error: any) {
            return { errors: [error.message] };
        }
    }
}
