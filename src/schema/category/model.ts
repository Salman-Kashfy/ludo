import BaseModel from '../baseModel';
import { Category as CategoryEntity } from '../../database/entity/Category';
import { Company } from '../../database/entity/Company';
import {CategoryInput, CategoryFilter} from './types';
import Context from "../context";
import {GlobalError} from "../root/enum";
import {isEmpty} from "lodash";
import { accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';
import { TableSessionStatus } from '../../database/entity/TableSession';

export default class Category extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;
    constructor(connection:any, context:Context) {
        super(connection, connection.getRepository(CategoryEntity), context);
    }

    async index(params: CategoryFilter) {
        if (!(await accessRulesByRoleHierarchy(this.context, {companyUuid: params.companyUuid}))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED],'Permission denied');
        }
        
        // Get company ID from company UUID
        const company = await this.connection.getRepository(Company).findOne({ 
            where: { uuid: params.companyUuid } 
        });
        
        if (!company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found');
        }
        
        const _query = this.repository.createQueryBuilder('c')
            .leftJoinAndSelect('c.tables', 't')
            .leftJoinAndSelect('t.tableSessions', 'ts', 'ts.status IN (:...activeStatuses)', { 
                activeStatuses: [TableSessionStatus.ACTIVE, TableSessionStatus.BOOKED] 
            })
            .leftJoinAndSelect('ts.customer', 'customer')
            .andWhere('c.companyId = :companyId', { companyId: company.id })
        
        if (!isEmpty(params?.searchText)) {
            _query.andWhere('c.name ILIKE :searchText', { searchText: `%${params.searchText}%` });
        }

        return { list: await _query.getMany() };
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
            // Get company ID from company UUID
            const company = await this.connection.getRepository(Company).findOne({ 
                where: { uuid: input.companyUuid } 
            });
            
            if (!company) {
                return {
                    data: null,
                    status: false,
                    errors: [GlobalError.RECORD_NOT_FOUND],
                    errorMessage: 'Company not found'
                };
            }

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
                    hourlyRate: input.hourlyRate,
                    companyId: company.id
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
