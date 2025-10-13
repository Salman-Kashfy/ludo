import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';
import { DirectiveNames } from './loadSchema';
import { disableAuthAccess, superAdmin } from '../config';

export default class AuthorizeResource {
  static isBrandAuthorized(context: any, brandId: string): Boolean {
    let brands = context.auth && context.auth.brands ? context.auth.brands : [];
    if (brands.indexOf(brandId) === -1) {
      return false;
    }
    return true;
  }
  static isGymAndBrandAuthorized(context: any, gymId: string, brandId: string): Boolean {
    let gyms = context.auth && context.auth.gyms ? context.auth.gyms : [];
    if (gyms.indexOf(gymId) === -1) {
      return AuthorizeResource.isBrandAuthorized(context, brandId);
    }
    return true;
  }
}

export function registerDirective(schema: GraphQLSchema, ...args: any) {
  return mapSchema(schema, {
    // Executes once for each object field in the schema
    [MapperKind.OBJECT_FIELD]: (field) => {
      // Check whether this field has the specified directive
      const directive = getDirective(schema, field, DirectiveNames.AuthorizeResource)?.[0];
      if (directive) {
        const { resolve } = field;
        if (!resolve) {
          return field;
        }
        let { action = '' } = directive ? directive : {};

        field.resolve = async function (source, args, context, info) {
          if (disableAuthAccess) {
            return resolve(source, args, context, info);
          }
          const roles = context.auth && context.auth.roles ? context.auth.roles : [];
          if (roles.indexOf(superAdmin) !== -1) {
            return resolve(source, args, context, info);
          }
          const { input } = args;
          let isAuthorized: Boolean = true;
          switch (action) {
            default:
              isAuthorized = true;
              break;
          }

          if (!isAuthorized) {
            throw new Error('Unauthorized to perform this action.');
          }
          return resolve(source, args, context, info);
        };
      }
      return field;
    },
  });
}
