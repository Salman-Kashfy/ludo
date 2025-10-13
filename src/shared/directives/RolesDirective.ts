import { disableAuthAccess } from '../config';
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { DirectiveNames } from './loadSchema';
import { GraphQLSchema } from 'graphql';

export function registerDirective(schema: GraphQLSchema) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (field) => {
            const directive = getDirective(schema, field, DirectiveNames.RolesDirective)?.[0];
            let { roles = [] } = directive ? directive : {};
            if (directive) {
                const { resolve } = field;
                if (!resolve) {
                    return field;
                }

                field.resolve = async function (source, args, context, info) {
                    if (disableAuthAccess) {
                        return resolve(source, args, context, info);
                    }
                    roles = (roles ? roles : []).filter((el: string) => el).map((el: string) => el.toLowerCase());
                    let userRoles: any = [];

                    if (context.auth && context.auth.roles) {
                        userRoles = (context.auth.roles ? context.auth.roles : [])
                            .filter((el: string) => el)
                            .map((el: string) => el.toLowerCase());
                    }

                    /**
                    * Iterate through each element in the first array. If some of them
                    * include the elements in the second array then return true.
                    * */
                    if (roles.length > 0 && !roles.some((el: string) => userRoles.includes(el))) {
                        throw new Error('Unable to perform this action. Please ask support to assign you role');
                    }
                    return resolve(source, args, context, info);
                };
            }
            return field;
        },
    });
}