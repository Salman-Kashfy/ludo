import { disableAuthAccess } from '../config';
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';
import {ForbiddenError} from 'apollo-server-express';
import { DirectiveNames } from './loadSchema';
import {Roles} from "../../database/entity/root/enums";

export function registerDirective(schema: GraphQLSchema) {
    try{
        return mapSchema(schema, {
            [MapperKind.OBJECT_FIELD]: (field) => {
                const directive = getDirective(schema, field, DirectiveNames.PermissionsDirective)?.[0];
                if (directive) {
                    const { resolve } = field;
                    if (!resolve) {
                        return field;
                    }
                    let { permissions = [] } = directive ? directive : {};
                    field.resolve = async function (source, args, context, info) {
                        if (disableAuthAccess) {
                            return resolve(source, args, context, info);
                        }

                        const role = context.user.role
                        permissions = permissions.filter((el: string) => el).map((el: string) => el.toLowerCase().trim());

                        if(role.name !== Roles.ADMIN){
                            const rolePermission = await context.rolePermission.repository.find({
                                relations: ['permission'],
                                where: { roleId: role.id }
                            })

                            let userPermissions = rolePermission.map((rp:any) => rp.permission.name)
                            for (const permission of permissions) {
                                if(!userPermissions.includes(permission)){
                                    throw new ForbiddenError('Unable to perform this action. Please ask support to give you permissions');
                                }
                            }
                        }

                        return resolve(source, args, context, info);
                    };
                }
                return field;
            },
        });
    }catch (e) {
        console.log(e)
        throw e;
    }

}