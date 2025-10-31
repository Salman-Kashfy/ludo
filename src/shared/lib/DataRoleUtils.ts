import {Roles} from "../../database/entity/root/enums";
import Context from "../../schema/context";
import { allowFilterPerRole } from "../config";

export function isAdmin(user: any) {
    try {
        if (!user) {
            throw new Error('No user found');
        }
        if (user.role.find((e:any) => e.name === Roles.ADMIN)) {
            return true;
        }
    } catch (error) {
        console.log('isAdmin', error);
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
        case Roles.ADMIN:
            return true;

        default:
            return user.companyId === companyId;

    }
}

export function accessRulesByRoleHierarchyUuid(ctx: Context, { companyUuid }: { companyUuid: string }): boolean {
    const user: any = ctx.user;
    if (!user) {
        console.error("accessRulesByRoleHierarchyUuid: No user found in context");
        return false;
    }

    const role = user.role?.name;
    switch (role) {
        case Roles.ADMIN:
            return true;

        default:
            return user.companyUuid === companyUuid;

    }
}

export function addQueryBuilderFilters(ctx:Context, query:any, params:any, companyIdField:string = 'companyId') {
    try {
        const user:any = ctx.user
        if (user.role.name === Roles.ADMIN) {
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

export function addQueryBuilderFiltersByUuid(ctx:Context, query:any, params:any, companyUuidField:string = 'companyUuid') {
    try {
        const user:any = ctx.user
        if (user.role.name === Roles.ADMIN) {
            return { query, params };
        }

        const queryName = query.expressionMap.mainAlias.name;
        query.andWhere('"' + queryName + '"."' + companyUuidField + '" = :companyUuid');
        params.companyUuid = user.companyUuid;

        return { query, params };
    } catch (error) {
        console.log('addQueryBuilderFiltersByUuid', error);
    }
}

export async function addQueryBuilderFiltersForCompanies(
    context: any,
    query: any,
    params: any,
    companyIdField: string = 'companyId'
): Promise<{ query: any; params: any }> {
    try {
        params = params || {};

        if (!allowFilterPerRole) {
            return { query, params };
        }

        const user = context.user;

        // Check if role is an array or single object
        const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
        
        // ADMIN role has access to all companies
        if (userRole?.name === Roles.ADMIN) {
            return { query, params };
        }

        // EMPLOYEE role is restricted to their own company
        if (userRole?.name === Roles.EMPLOYEE) {
            const queryName = query.expressionMap.mainAlias.name;
            query.andWhere('"' + queryName + '"."' + companyIdField + '" = :companyId');
            params.companyId = user.companyId;
            return { query, params };
        }

        // If no valid role, restrict access
        query.andWhere('(false)');
        return { query, params };

    } catch (error: any) {
        console.log('Error filtering companies by user role: ' + JSON.stringify(error.message));
        // On error, restrict access for safety
        query.andWhere('(false)');
        return { query, params };
    }
}