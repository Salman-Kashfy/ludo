import BaseModel from '../baseModel';
import { Category as CategoryEntity } from '../../database/entity/Category';
import { Company } from '../../database/entity/Company';
import { Status } from '../../database/entity/root/enums';
import {CategoryInput, CategoryFilter} from './types';
import Context from "../context";
import {GlobalError} from "../root/enum";
import {isEmpty} from "lodash";
import { accessRulesByRoleHierarchy, accessRulesByRoleHierarchyUuid } from '../../shared/lib/DataRoleUtils';
import { TableSessionStatus } from '../../database/entity/TableSession';
import { TableStatus } from '../table/types';

export default class Category extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;
    constructor(connection:any, context:Context) {
        super(connection, connection.getRepository(CategoryEntity), context);
    }

    async index(params: CategoryFilter) {
        if (!(await accessRulesByRoleHierarchyUuid(this.context, {companyUuid: params.companyUuid}))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }
        
        // Get company ID from company UUID
        const company = await this.connection.getRepository(Company).findOne({ 
            where: { uuid: params.companyUuid } 
        });
        
        if (!company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found');
        }
        
        const _query = await this.mainQuery()
            .leftJoinAndSelect('t.tableSessions', 'ts', 'ts.status IN (:...activeStatuses)', { 
                activeStatuses: [TableSessionStatus.ACTIVE, TableSessionStatus.BOOKED] 
            })
            .andWhere('c.companyId = :companyId', { companyId: company.id })
        
        if (!isEmpty(params?.searchText)) {
            _query.andWhere('c.name ILIKE :searchText', { searchText: `%${params.searchText}%` });
        }

        _query.orderBy('t.sortNo', 'ASC');
        _query.addOrderBy('cp.price', 'ASC');

        return { list: await _query.getMany() };
    }

    async show(uuid: string) {
        const data = await this.mainQuery()
            .where('c.uuid = :uuid', { uuid })
            .orderBy('cp.price', 'ASC')
            .getOne();

        if(!data) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Category not found');
        }
        if(!(await accessRulesByRoleHierarchy(this.context, {companyId: data?.companyId}))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }
        return this.successResponse(data);
    }

    mainQuery() {
        return this.repository.createQueryBuilder('c')
        .leftJoinAndSelect('c.tables', 't')
        .leftJoinAndSelect('c.categoryPrices', 'cp')
        .where('t.status != :inactiveStatus', { inactiveStatus: TableStatus.INACTIVE })
    }

    async saveValidate(input: CategoryInput) {
        let errors: any = [], errorMessage = null, data: any = {};

        data.company = await this.context.company.repository.findOne({ where: { uuid: input.companyUuid } });
        if (!data.company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found');
        }

        if (!(await accessRulesByRoleHierarchyUuid(this.context, {companyUuid: input.companyUuid}))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED],'Permission denied');
        }

        if (input.uuid) {
            data.existingEntity = await this.repository.findOne({ where: { uuid: input.uuid } });
            if (!data.existingEntity) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Category not found');
            }
        }

        return {data, errors, errorMessage};
    }

    async save(input: CategoryInput) {
        const {data, errors, errorMessage} = await this.saveValidate(input);
        if (!isEmpty(errors)) {
            return this.formatErrors(errors, errorMessage);
        }

        try {
            const {existingEntity, company} = data;
            let category = existingEntity || new CategoryEntity();
            const transaction = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                category.name = input.name;
                category.hourlyRate = input.hourlyRate;
                category.companyId = company.id;
                category.createdById = category.createdById || this.context.auth.id;
                category.lastUpdatedById = this.context.auth.id;

                category = await transactionalEntityManager.save(category);

                if (input.categoryPrices && input.categoryPrices.length > 0) {
                    // Delete existing category prices for this category
                    await transactionalEntityManager
                        .createQueryBuilder()
                        .delete()
                        .from(this.context.categoryPrice.repository.target)
                        .where('categoryId = :categoryId', { categoryId: category.id })
                        .execute();
                    
                    // Create new category prices
                    const categoryPrices = input.categoryPrices.map(price => 
                        transactionalEntityManager.create(this.context.categoryPrice.repository.target, {
                            categoryId: category.id,
                            price: price.price,
                            unit: price.unit,
                            duration: price.duration,
                            freeMins: price.freeMins,
                            currencyName: price.currencyName || 'PKR'
                        })
                    );

                    await transactionalEntityManager.save(categoryPrices);
                }
                return category
            });

            if (transaction && transaction.error && transaction.error.length > 0) {
                console.log(transaction.error);
                return this.formatErrors(GlobalError.INTERNAL_SERVER_ERROR, transaction.error);
            }

            return this.successResponse(transaction);
        } catch (error:any) {
            console.log(error);
            return this.formatErrors(GlobalError.INTERNAL_SERVER_ERROR, error.message);
        }
    }
}
