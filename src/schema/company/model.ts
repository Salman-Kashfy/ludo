import BaseModel from '../baseModel';
import { Company as CompanyEntity } from '../../database/entity/Company';
import {CompanyInput, CompanyFilter, UpdateCompanyStatusInput} from './types';
import Context from "../context";
import {GlobalError} from "../root/enum";
import {isEmpty} from "lodash";
import {PagingInterface} from "../../interfaces";
import {accessRulesByRoleHierarchy, addQueryBuilderFiltersForCompanies} from "../../shared/lib/DataRoleUtils";

export default class Role extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;
    constructor(connection:any, context:Context) {
        super(connection, connection.getRepository(CompanyEntity), context);
    }

    async index(paging: PagingInterface, params: CompanyFilter) {
        const _query = this.repository.createQueryBuilder('c');
        const { query, params: filteredParams } = await addQueryBuilderFiltersForCompanies(this.context, _query, params, 'id');
        const finalQuery = this.resolveParamsToFilters(query, filteredParams);
        finalQuery.orderBy('c.name', 'ASC');
        return this.paginator(finalQuery, paging);
    }

    /**
     * Retrieve company based on admin role.
     * */
    async show(uuid:string) {
        const company = await this.repository.findOneBy({uuid})
        if (!company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found')
        }

        if (!(await accessRulesByRoleHierarchy(this.context, {companyId: company.id}))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED],'Permission denied')
        }

        return { data:company }
    }

    resolveParamsToFilters(query: any, params: CompanyFilter) {
        if (params?.searchText) {
            query.andWhere('(c.name ILIKE :searchText)')
        }
        query.setParameters(params);
        return query;
    }


    async saveValidate(input:CompanyInput) {
        let errors:any = [], errorMessage = null, data:any = {}
        if(input.uuid){
            data.existingEntity = await this.context.company.repository.findOneBy({
                uuid: input.uuid
            })
            if(!data.existingEntity){
                return this.formatErrors(GlobalError.RECORD_NOT_FOUND, 'Company not found')
            }
        }else{
            data.existingEntity = await this.context.company.repository.findOneBy({
                name: input.name
            })
            if(data.existingEntity){
                return this.formatErrors(GlobalError.ALREADY_EXISTS, 'Record already exists')
            }
        }

        return { data, errors, errorMessage }
    }

    async save(input:CompanyInput) {
        try {
            const {data, errors, errorMessage} = await this.saveValidate(input)
            if (!isEmpty(errors)) {
                return this.formatErrors(errors, errorMessage);
            }

            const {existingEntity} = data;
            const company: CompanyEntity = existingEntity || new CompanyEntity();
            const transaction = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                company.name = input.name;
                company.description = input.description;
                company.email = input.email;
                company.logo = input.logo;
                company.phoneCode = input.phoneCode;
                company.phoneNumber = input.phoneNumber;
                await transactionalEntityManager.save(company);
            });

            if (transaction && transaction.error && transaction.error.length > 0) {
                console.log(transaction.error);
                return this.formatErrors(GlobalError.INTERNAL_SERVER_ERROR, transaction.error)
            }
            return this.successResponse(company);  
        } catch (e:any) {
            console.log(e);
            return {errors: [GlobalError.INTERNAL_SERVER_ERROR], message: e.message};
        }
    }

    /**
     * Activate/Deactivate company.
     * */
    async updateCompanyStatus(input:UpdateCompanyStatusInput) {
        const {uuid, status} = input
        const company = await this.repository.findOneBy({uuid})
        if (!company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found')
        }
        if (!(await accessRulesByRoleHierarchy(this.context, {companyId: company.id}))) {
            return this.errorResponse(GlobalError.NOT_ALLOWED)
        }
        company.status = status
        await company.save()
        return this.successResponse(company)
    }
}
