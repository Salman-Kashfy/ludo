import BaseModel from '../baseModel';
import { Category as CategoryEntity } from '../../database/entity/Category';
import {CategoryInput, CategoryFilter} from './types';
import Context from "../context";
import {GlobalError} from "../root/enum";
import {isEmpty} from "lodash";
import {PagingInterface} from "../../interfaces";
import { accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';

export default class Category extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;
    constructor(connection:any, context:Context) {
        super(connection, connection.getRepository(CategoryEntity), context);
    }

    async index(paging: PagingInterface, params: CategoryFilter) {
        const _query = this.repository.createQueryBuilder('c')
            .leftJoinAndSelect('c.tables', 'tables');
        
        if (!isEmpty(params?.searchText)) {
            _query.andWhere('c.name ILIKE :searchText', { searchText: `%${params.searchText}%` });
        }

        return await this.paginator(_query, paging);
    }

    async show(uuid: string) {
        try {
            const data = await this.repository.findOne({ where: { uuid } });
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

    async saveValidate(input: CategoryInput) {
        let errors: any = [], errorMessage = null, data: any = {};

        if (!(await accessRulesByRoleHierarchy(this.context, {companyUuid: input.companyUuid}))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED],'Permission denied');
        }

        if (errors.length > 0) {
            return {
                data: null,
                status: false,
                errors,
                errorMessage
            };
        }

        return {
            data,
            status: true,
            errors: null,
            errorMessage: null
        };
    }

    async save(input: CategoryInput) {
        const validation = await this.saveValidate(input);
        if (!validation.status) {
            return validation;
        }

        try {
            let data;
            if (input.uuid) {
                data = await this.repository.findOne({ where: { uuid: input.uuid } });
                if (!data) {
                    return {
                        data: null,
                        status: false,
                        errors: [GlobalError.RECORD_NOT_FOUND],
                        errorMessage: 'Category not found'
                    };
                }
                data.name = input.name;
                data.hourlyRate = input.hourlyRate;
            } else {
                data = this.repository.create({
                    name: input.name,
                    hourlyRate: input.hourlyRate
                });
            }

            data = await this.repository.save(data);

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
