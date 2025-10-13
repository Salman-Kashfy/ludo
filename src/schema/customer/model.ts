import BaseModel from '../baseModel';
import { Customer as CustomerEntity } from '../../database/entity/Customer';
import { CustomerInput, CustomerFilter } from './types';
import Context from "../context";
import { GlobalError } from "../root/enum";
import { isEmpty } from "lodash";
import { PagingInterface } from "../../interfaces";

export default class Customer extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(CustomerEntity), context);
    }

    async index(paging: PagingInterface, params: CustomerFilter) {
        const _query = this.repository.createQueryBuilder('c');

        if (!isEmpty(params.searchText)) {
            _query.andWhere('(c.firstName ILIKE :searchText OR c.lastName ILIKE :searchText OR c.phoneNumber ILIKE :searchText)', {
                searchText: `%${params.searchText}%`
            });
        }

        return await this.paginator(_query, paging);
    }

    async show(id: number) {
        try {
            const data = await this.repository.findOne({
                where: { id }
            });
            return {
                data,
                status: true,
                errors: null,
                errorMessage: null
            };
        } catch (error: any) {
            return {
                data: null,
                status: false,
                errors: [GlobalError.INTERNAL_SERVER_ERROR],
                errorMessage: error.message
            };
        }
    }

    async saveValidate(input: CustomerInput) {
        let errors: any = [], errorMessage = null, data: any = {};

        if (isEmpty(input.firstName)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'First name is required';
        }

        if (isEmpty(input.lastName)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Last name is required';
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

    async save(input: CustomerInput) {
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
                        errorMessage: 'Customer not found'
                    };
                }
                data.firstName = input.firstName;
                data.lastName = input.lastName;
                data.phoneCode = input.phoneCode;
                data.phoneNumber = input.phoneNumber;
            } else {
                data = this.repository.create({
                    firstName: input.firstName,
                    lastName: input.lastName,
                    phoneCode: input.phoneCode,
                    phoneNumber: input.phoneNumber
                });
            }

            data = await this.repository.save(data);

            return {
                data,
                status: true,
                errors: null,
                errorMessage: null
            };
        } catch (error: any) {
            return {
                data: null,
                status: false,
                errors: [GlobalError.INTERNAL_SERVER_ERROR],
                errorMessage: error.message
            };
        }
    }

    async delete(id: number) {
        try {
            const customer = await this.repository.findOne({ where: { id } });
            if (!customer) {
                return {
                    status: false,
                    errors: [GlobalError.RECORD_NOT_FOUND],
                    errorMessage: 'Customer not found'
                };
            }

            await this.repository.remove(customer);

            return {
                status: true,
                errors: null,
                errorMessage: null
            };
        } catch (error: any) {
            return {
                status: false,
                errors: [GlobalError.INTERNAL_SERVER_ERROR],
                errorMessage: error.message
            };
        }
    }
}
