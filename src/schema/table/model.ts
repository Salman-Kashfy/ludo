import BaseModel from '../baseModel';
import { Table as TableEntity, TableStatus } from '../../database/entity/Table';
import {TableInput, TableFilter, UpdateTableStatusInput} from './types';
import Context from "../context";
import {GlobalError} from "../root/enum";
import {isEmpty} from "lodash";
import {PagingInterface} from "../../interfaces";
import { accessRulesByRoleHierarchyUuid, accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';

export default class Table extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;
    constructor(connection:any, context:Context) {
        super(connection, connection.getRepository(TableEntity), context);
    }

    async index(params: TableFilter) {

        if (!(await accessRulesByRoleHierarchyUuid(this.context, {companyUuid: params.companyUuid}))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        const company = await this.context.company.repository.findOne({ where: { uuid: params.companyUuid } });
        if (!company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found');
        }

        const _query = this.repository.createQueryBuilder('t')
            .leftJoinAndSelect('t.category', 'category')
            .andWhere('t.companyId = :companyId', { companyId: company.id });
        
        if (!isEmpty(params.searchText)) {
            _query.andWhere('t.name ILIKE :searchText', { searchText: `%${params.searchText}%` });
        }

        if (params.categoryId) {
            _query.andWhere('t.categoryId = :categoryId', { categoryId: params.categoryId });
        }

        if (params.status) {
            _query.andWhere('t.status = :status', { status: params.status });
        }

        _query.orderBy('t.sortNo', 'ASC');

        return this.successResponse(await _query.getMany());
    }

    async show(uuid: string) {
        try {
            const data = await this.repository.findOne({ 
                where: { uuid },
                relations: ['category']
            });

            if(!data) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Table not found');
            }

            if(!(await accessRulesByRoleHierarchy(this.context, { companyId: data.category.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            return this.successResponse(data);
        } catch (error:any) {
            return {
                data: null,
                status: false,
                errors: [GlobalError.INTERNAL_SERVER_ERROR],
                errorMessage: error.message
            };
        }
    }

    async saveValidate(input: TableInput) {
        let errors: any = [], errorMessage = null, data: any = {};

        if (!(await accessRulesByRoleHierarchyUuid(this.context, { companyUuid: input.companyUuid }))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied - user does not belong to this company');
        }

        data.category = await this.context.category.repository.findOne({ where: { uuid: input.categoryUuid } });
        if (!data.category) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Category not found');
        }

        data.company = await this.context.company.repository.findOne({ where: { uuid: input.companyUuid } });
        if (!data.company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found');
        }

        if (input.uuid) {
            data.existingEntity = await this.repository.findOne({ where: { uuid: input.uuid } });
            if (!data.existingEntity) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Table not found');
            }
        }

        if (errors.length > 0) {
            return this.formatErrors(errors, errorMessage);
        }

        return { data, errors, errorMessage }
    }

    async save(input: TableInput) {
        const { data, errors, errorMessage } = await this.saveValidate(input);
        if (!isEmpty(errors)) {
            return this.formatErrors(errors, errorMessage);
        }

        try {
            const { category, company, existingEntity } = data;
            let table = existingEntity || new TableEntity();
            
            table.name = input.name;
            table.categoryId = category.id;
            table.companyId = company.id;
            table.status = input.status || TableStatus.AVAILABLE;
            table.sortNo = input.sortNo;
            table.createdById = table.createdById || this.context.user.id;
            table.lastUpdatedById = this.context.user.id;

            table = await this.repository.save(table);

            return this.successResponse(table);
        } catch (error:any) {
            console.log(error);
            return {
                data: null,
                status: false,
                errors: [GlobalError.INTERNAL_SERVER_ERROR],
                errorMessage: error.message
            };
        }
    }

    async updateTableStatus(input: UpdateTableStatusInput) {
        try {
            const data = await this.repository.findOne({ where: { id: input.id } });
            if (!data) {
                return {
                    data: null,
                    status: false,
                    errors: [GlobalError.RECORD_NOT_FOUND],
                    errorMessage: 'Table not found'
                };
            }

            data.status = input.status;
            await this.repository.save(data);

            return {
                data,
                status: true,
                errors: null,
                errorMessage: null
            };
        } catch (error:any) {
            return {
                data: null,
                status: false,
                errors: [GlobalError.INTERNAL_SERVER_ERROR],
                errorMessage: error.message
            };
        }
    }
}
