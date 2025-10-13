import {Roles} from "../../database/entity/root/enums";
import Context from "../../schema/context";

export function isSuperAdmin(user: any) {
    try {
        if (!user) {
            throw new Error('No user found');
        }
        if (user.role.find((e:any) => e.name === Roles.SUPER_ADMIN)) {
            return true;
        }
    } catch (error) {
        console.log('isSuperAdminOrPlatformTeamAdmin', error);
    }
    return false;
}

export function accessRulesByRoleHierarchy(ctx: Context, { companyId }: { companyId: number }): boolean {
    const user: any = ctx.user;
    if (!user) {
        console.error("accessRulesByRoleHierarchy: No user found in context");
        return false;
    }

    const role = user.role?.name;
    switch (role) {
        case Roles.SUPER_ADMIN:
            return true;

        default:
            return user.companyId === companyId;

    }
}

export function addQueryBuilderFilters(ctx:Context, query:any, params:any, companyIdField:string = 'companyId') {
    try {
        const user:any = ctx.user
        if (user.role.name === Roles.SUPER_ADMIN) {
            return { query, params };
        }

        const queryName = query.expressionMap.mainAlias.name;
        query.andWhere('"' + queryName + '"."' + companyIdField + '" = :companyId');
        params.companyId = user.companyId;

        return { query, params };
    } catch (error) {
        console.log('addQueryBuilderFilters', error);
    }
}