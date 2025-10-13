import { disableAuthAccess } from '../config';
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';
import { DirectiveNames } from './loadSchema';

export function registerDirective(schema: GraphQLSchema) {
    return mapSchema(schema, {
        // Executes once for each object field in the schema
        [MapperKind.OBJECT_FIELD]: (field) => {
            // Check whether this field has the specified directive
            const directive = getDirective(schema, field, DirectiveNames.AuthDirective)?.[0];
            if (directive) {
                const { resolve } = field;
                if (!resolve) {
                    return field;
                }

                field.resolve = async function (source, args, context, info) {
                    if (disableAuthAccess) {
                        return resolve(source, args, context, info);
                    }
                    if (!context.user) {
                        throw new Error('Authentication required !');
                    }
                    return resolve(source, args, context, info);
                };
            }
            return field;
        },
    });
}