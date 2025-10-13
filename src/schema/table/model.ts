import BaseModel from '../baseModel';
import { Table as TableEntity, TableStatus } from '../../database/entity/Table';
import {TableInput, TableFilter, UpdateTableStatusInput} from './types';
import Context from "../context";
import {GlobalError} from "../root/enum";
import {isEmpty} from "lodash";
import {PagingInterface} from "../../interfaces";

export default class Table extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;
    constructor(connection:any, context:Context) {
        super(connection, connection.getRepository(TableEntity), context);
    }

    async index(paging: PagingInterface, params: TableFilter) {
        const _query = this.repository.createQueryBuilder('t')
            .leftJoinAndSelect('t.category', 'category');
        
        if (!isEmpty(params.searchText)) {
            _query.andWhere('t.name ILIKE :searchText', { searchText: `%${params.searchText}%` });
        }

        if (params.categoryId) {
            _query.andWhere('t.categoryId = :categoryId', { categoryId: params.categoryId });
        }

        if (params.status) {
            _query.andWhere('t.status = :status', { status: params.status });
        }

        return await this.paginator(_query, paging);
    }

    async show(id: number) {
        try {
            const data = await this.repository.findOne({ 
                where: { id },
                relations: ['category']
            });
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

    async saveValidate(input: TableInput) {
        let errors: any = [], errorMessage = null, data: any = {};

        if (isEmpty(input.name)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Name is required';
        }

        if (!input.categoryId) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Category ID is required';
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

    async save(input: TableInput) {
        const validation = await this.saveValidate(input);
        if (!validation.status) {
            return validation;
        }

        try {
            let data;
            if (input.id) {
                data = await this.repository.findOne({ where: { id: input.id } });
                if (!data) {
                    return {
                        data: null,
                        status: false,
                        errors: [GlobalError.RECORD_NOT_FOUND],
                        errorMessage: 'Table not found'
                    };
                }
                data.name = input.name;
                data.categoryId = input.categoryId;
                if (input.status) {
                    data.status = input.status;
                }
            } else {
                data = this.repository.create({
                    name: input.name,
                    categoryId: input.categoryId,
                    status: input.status || TableStatus.AVAILABLE
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
