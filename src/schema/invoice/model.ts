import BaseModel from '../baseModel';
import { Invoice as InvoiceEntity, InvoiceStatus } from '../../database/entity/Invoice';
import Context from "../context";
import { GlobalError } from "../root/enum";
import { isEmpty } from "lodash";
import { PagingInterface } from "../../interfaces";

export default class Invoice extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(InvoiceEntity), context);
    }

    async index(paging: PagingInterface, params: any) {
        const _query = this.repository.createQueryBuilder('i')
            .leftJoinAndSelect('i.customer', 'customer')
            .leftJoinAndSelect('i.tableSession', 'tableSession');

        if (!isEmpty(params.searchText)) {
            _query.andWhere('(customer.firstName ILIKE :searchText OR customer.lastName ILIKE :searchText)', {
                searchText: `%${params.searchText}%`
            });
        }
        if (!isEmpty(params.customerId)) {
            _query.andWhere('i.customerId = :customerId', { customerId: params.customerId });
        }
        if (!isEmpty(params.status)) {
            _query.andWhere('i.status = :status', { status: params.status });
        }

        _query.orderBy('i.createdAt', 'DESC');

        return await this.paginator(_query, paging);
    }

    async show(uuid: string) {
        try {
            const data = await this.repository.findOne({
                where: { uuid },
                relations: ['customer', 'tableSession']
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

    async create(input: any) {
        try {
            const invoice = this.repository.create(input);
            const savedInvoice = await this.repository.save(invoice);
            return {
                data: savedInvoice,
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

    async update(input: any) {
        try {
            const { id, ...updateData } = input;
            const invoice = await this.repository.findOne({ where: { uuid: id } });
            
            if (!invoice) {
                return {
                    data: null,
                    status: false,
                    errors: [GlobalError.NOT_FOUND],
                    errorMessage: 'Invoice not found'
                };
            }

            Object.assign(invoice, updateData);
            const updatedInvoice = await this.repository.save(invoice);
            
            return {
                data: updatedInvoice,
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

    async updateStatus(input: any) {
        try {
            const { id, status } = input;
            const invoice = await this.repository.findOne({ where: { uuid: id } });
            
            if (!invoice) {
                return {
                    data: null,
                    status: false,
                    errors: [GlobalError.NOT_FOUND],
                    errorMessage: 'Invoice not found'
                };
            }

            invoice.status = status;
            const updatedInvoice = await this.repository.save(invoice);
            
            return {
                data: updatedInvoice,
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
}
