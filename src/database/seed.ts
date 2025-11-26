import 'reflect-metadata';
import connection from './connection';
import {hash} from "bcrypt";
import { Role } from './entity/Role';
import { User } from './entity/User';
import { UserRole } from './entity/UserRole';
import { Category } from './entity/Category';
import { CategoryPrice } from './entity/CategoryPrice';
import { Table } from './entity/Table';
import { Permission } from './entity/Permission';
import { Company } from './entity/Company';
import { Customer } from './entity/Customer';
import { Tournament } from './entity/Tournament';
import { TournamentPlayer } from './entity/TournamentPlayer';

const COUNTRY_ID = 167
const STATE_ID = 3008
const CITY_ID = 83559
const REGULAR_CATEGORY_ID = 1
const SPECIAL_CATEGORY_ID = 2
const PREMIUM_CATEGORY_ID = 3
const TABLE_ID = 1
const COMPANY_ID = 1
const CUSTOMER_ID = 1
const TOURNAMENT_ID = 1 // Weekly Championship tournament ID
const COMPANY_UUID = '550e8400-e29b-41d4-a716-446655440000' // Predefined UUID for the company

import { roles } from './objects/roles';
import { users } from './objects/users';
import { userRoles } from './objects/userRoles';
import { categories } from './objects/categories';
import { categoryPrices } from './objects/categoryPrices';
import { tables } from './objects/tables';
import { permissions } from './objects/permissions';
import { rolePermissions } from './objects/rolePermissions';
import { companies } from './objects/companies';
import { customers } from './objects/customers';
import { tournaments } from './objects/tournaments';
import { tournamentPlayers } from './objects/tournamentPlayers';
import {RolePermission} from "./entity/RolePermission";

export const startSeeding = async () => {

    await connection.initialize();
    const passwordHash = await hash('qwerty', 10);

    try {

        console.log('Adding Companies');
        const _companies = companies({companyId: COMPANY_ID, companyUuid: COMPANY_UUID});
        await connection.createQueryBuilder().insert().into(Company).values(Object.values(_companies)).execute();

        console.log('Adding Categories');
        const _categories = categories({
            regularCategoryId: REGULAR_CATEGORY_ID,
            specialCategoryId: SPECIAL_CATEGORY_ID,
            premiumCategoryId: PREMIUM_CATEGORY_ID,
            companyId: COMPANY_ID
        });
        await connection.createQueryBuilder().insert().into(Category).values(Object.values(_categories)).execute();

        console.log('Adding Category Prices');
        const _categoryPrices = categoryPrices({
            regularCategoryId: REGULAR_CATEGORY_ID,
            specialCategoryId: SPECIAL_CATEGORY_ID,
            premiumCategoryId: PREMIUM_CATEGORY_ID
        });
        await connection.createQueryBuilder().insert().into(CategoryPrice).values(Object.values(_categoryPrices)).execute();
        
        console.log('Adding Tables');
        const _tables = tables({
            regularCategoryId: REGULAR_CATEGORY_ID,
            specialCategoryId: SPECIAL_CATEGORY_ID,
            premiumCategoryId: PREMIUM_CATEGORY_ID,
            companyId: COMPANY_ID
        });
        await connection.createQueryBuilder().insert().into(Table).values(Object.values(_tables)).execute();
        
        console.log('Adding Customers');
        const _customers = customers({customerId:CUSTOMER_ID, companyId: COMPANY_ID});
        await connection.createQueryBuilder().insert().into(Customer).values(Object.values(_customers)).execute();
        
        console.log('Adding Roles');
        const _roles = roles();
        await connection.createQueryBuilder().insert().into(Role).values(Object.values(_roles)).execute();
        
        console.log('Adding Users');
        const _users = await users({passwordHash, countryId:COUNTRY_ID,  companyId:COMPANY_ID, companyUuid: COMPANY_UUID});
        await connection.createQueryBuilder().insert().into(User).values(Object.values(_users)).execute();

        console.log('Adding Tournaments');
        const _tournaments = tournaments({
            companyId: COMPANY_ID,
            regularCategoryId: REGULAR_CATEGORY_ID,
            specialCategoryId: SPECIAL_CATEGORY_ID,
            premiumCategoryId: PREMIUM_CATEGORY_ID
        });
        await connection.createQueryBuilder().insert().into(Tournament).values(Object.values(_tournaments)).execute();
        
        console.log('Adding Tournament Players');
        const _tournamentPlayers = tournamentPlayers({ tournamentId: TOURNAMENT_ID });
        await connection.createQueryBuilder().insert().into(TournamentPlayer).values(Object.values(_tournamentPlayers)).execute();
        
        console.log('Adding User Roles');
        const _userRoles = await userRoles();
        await connection.createQueryBuilder().insert().into(UserRole).values(Object.values(_userRoles)).execute();
        
        console.log('Adding Permissions');
        const _permissions = await permissions();
        await connection.createQueryBuilder().insert().into(Permission).values(Object.values(_permissions)).execute();

        console.log('Adding Role Permissions');
        const _rolePermissions = await rolePermissions();
        await connection.createQueryBuilder().insert().into(RolePermission).values(Object.values(_rolePermissions)).execute();

        console.log('DB seed completed.');
        await connection.close();
    }catch (e) {
        console.log(e)
    }

}

startSeeding();