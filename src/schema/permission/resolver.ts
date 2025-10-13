export default {
    Mutation: {
        loadPermissionsFromServer(root: any, {idIndex, nameIndex, rolesIndex, link} : any, context: any) {
            return context.permission.loadPermissionsFromServer(idIndex, nameIndex, rolesIndex, link);
        }
    },
};