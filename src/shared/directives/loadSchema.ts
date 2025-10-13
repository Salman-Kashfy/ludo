import { GraphQLSchema } from 'graphql';
import * as RolesDirective from './RolesDirective';
import * as PermissionsDirective from './PermissionsDirective';
import * as AuthDirective from './AuthDirective';
import * as AuthorizeResource from './AuthorizeResource';
import { addResolversToSchema } from '@graphql-tools/schema';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { join } from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers } from '@graphql-tools/merge';

export enum DirectiveNames {
  AuthDirective = 'requireAuth',
  PermissionsDirective = 'requirePermissions',
  RolesDirective = 'requireRoles',
  AuthorizeResource = 'authorizeResource',
}

const allResolvers: any[] = loadFilesSync(join(__dirname, './../../schema/**/resolvers.*'));
const mergedResolvers = mergeResolvers(allResolvers);

export function registerDirectives(schema: GraphQLSchema): GraphQLSchema {
  const directivesList = [AuthDirective, RolesDirective, PermissionsDirective, AuthorizeResource];
  directivesList.forEach((directive) => {
    schema = directive.registerDirective(schema);
  });
  return schema;
}
const schema = loadSchemaSync(join(__dirname, './../../schema/**/*.graphql'), { loaders: [new GraphQLFileLoader()] });

let schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers: mergedResolvers,
});
export default registerDirectives(schemaWithResolvers);
