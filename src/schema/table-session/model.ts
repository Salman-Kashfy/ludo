import BaseModel from '../baseModel';
import { TableSession as TableSessionEntity, TableSessionStatus } from '../../database/entity/TableSession';
import { InvoiceStatus } from '../../database/entity/Invoice';
import { StartTableSessionInput, EndTableSessionInput, TableSessionFilter } from './types';
import Context from "../context";
import { GlobalError } from "../root/enum";
import { BookTableSessionInput } from './types';
import { isEmpty, result } from "lodash";
import { PagingInterface } from "../../interfaces";
import { In } from 'typeorm';
import { PaymentStatus } from '../payment/types';
import { accessRulesByRoleHierarchyUuid } from '../../shared/lib/DataRoleUtils';

export default class TableSession extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TableSessionEntity), context);
    }

    async index(paging: PagingInterface, params: TableSessionFilter) {
        const _query = this.repository.createQueryBuilder('ts')
            .leftJoinAndSelect('ts.customer', 'customer')
            .leftJoinAndSelect('ts.table', 'table');

        if (!isEmpty(params.searchText)) {
            _query.andWhere('(customer.firstName ILIKE :searchText OR customer.lastName ILIKE :searchText)', {
                searchText: `%${params.searchText}%`
            });
        }
        if (!isEmpty(params.customerId)) {
            _query.andWhere('ts.customerId = :customerId', { customerId: params.customerId });
        }
        if (!isEmpty(params.tableId)) {
            _query.andWhere('ts.tableId = :tableId', { tableId: params.tableId });
        }
        if (!isEmpty(params.status)) {
            _query.andWhere('ts.status = :status', { status: params.status });
        }
        if (!isEmpty(params.dateFrom)) {
            _query.andWhere('ts.startTime >= :dateFrom', { dateFrom: params.dateFrom });
        }
        if (!isEmpty(params.dateTo)) {
            _query.andWhere('ts.startTime <= :dateTo', { dateTo: params.dateTo });
        }

        _query.orderBy('ts.startTime', 'DESC');

        return await this.paginator(_query, paging);
    }

    async show(id: string) {
        try {
            const data = await this.repository.findOne({
                where: { id },
                relations: ['customer', 'table']
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

    async getActiveSessions() {
        try {
            const data = await this.repository.find({
                where: { status: TableSessionStatus.ACTIVE },
                relations: ['customer', 'table']
            });
            return {
                list: data,
                paging: null
            };
        } catch (error: any) {
            return {
                list: [],
                paging: null
            };
        }
    }

    async bookSessionValidate(input: BookTableSessionInput) {
        let errors: any = [], errorMessage:any = null, data: any = {};

        if(!(await accessRulesByRoleHierarchyUuid(this.context, { companyUuid: input.companyUuid }))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], "Permission denied");
        }

        data.customer = await this.context.customer.repository.findOne({
            where: { uuid: input.customerUuid }
        });
        if (!data.customer) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], "Customer not found");
        }

        data.table = await this.context.table.repository.findOne({
            relations: ['category'],
            where: { uuid: input.tableUuid }
        });
        if (!data.table) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], "Table not found");
        }
        if (!data.table.category) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], "Table category not found");
        }

        const existingSession = await this.repository.findOne({
            where: { tableId: data.table.id, status: In([TableSessionStatus.ACTIVE, TableSessionStatus.BOOKED]) }
        });
        if (existingSession) {
            return this.formatErrors([GlobalError.ALREADY_EXISTS], "Table already has a booked session");
        }

        return { data, errors, errorMessage };
    }

    async bookSession(input: BookTableSessionInput) {
        const { errors, data, errorMessage } = await this.bookSessionValidate(input);
        if (errors.length > 0) {
          return this.formatErrors(errors, errorMessage);
        }
      
        try {
            const transaction = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {

            const session = transactionalEntityManager.create(this.repository.target, {
              customerId: data.customer.id,
              tableId: data.table.id,
              status: TableSessionStatus.BOOKED,
              hours: Number(input.hours),
            });
            
            await transactionalEntityManager.save(session);
      
            const payment = await this.context.payment.createPayment(transactionalEntityManager,{
              customerId: data.customer.id,
              tableSessionId: session.id,
              amount: data.table.category.hourlyRate * input.hours,
              method: input.paymentMethod.paymentScheme,
              status: PaymentStatus.SUCCESS,
            });
      
            if (!payment || !payment.status) {
              throw new Error('Payment processing failed');
            }
      
            return session;
          });

          if(transaction && transaction.error && transaction.error.length > 0) {
            console.log('transaction.error: ', transaction.error);
            return this.formatErrors([GlobalError.EXCEPTION], transaction.error);
          } 
          
          return this.successResponse(transaction);
        } catch (error: any) {
          console.log('error: ', error);
          return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
      }

    async startSessionValidate(input: StartTableSessionInput) {
        let errors: any = [], errorMessage = null, data: any = {};

        // Validate customer exists
        data.customer = await this.context.customer.repository.findOne({
            where: { id: input.customerId }
        });
        if (!data.customer) {
            errors.push(GlobalError.RECORD_NOT_FOUND);
            errorMessage = 'Customer not found';
        }

        // Validate table exists
        data.table = await this.context.table.repository.findOne({
            where: { id: input.tableId }
        });
        if (!data.table) {
            errors.push(GlobalError.RECORD_NOT_FOUND);
            errorMessage = 'Table not found';
        }

        // Check if table already has an active session
        const existingSession = await this.repository.findOne({
            where: { 
                tableId: input.tableId, 
                status: TableSessionStatus.ACTIVE 
            }
        });
        if (existingSession) {
            errors.push(GlobalError.ALREADY_EXISTS);
            errorMessage = 'Table already has an active session';
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

    async startSession(input: StartTableSessionInput) {
        const validation = await this.startSessionValidate(input);
        if (!validation.status) {
            return validation;
        }

        try {
            const { customer, table } = validation.data;

            // Create new table session
            const session = this.repository.create({
                customerId: input.customerId,
                tableId: input.tableId,
                startTime: new Date(),
                status: TableSessionStatus.ACTIVE
            });

            const savedSession = await this.repository.save(session);

            return {
                data: savedSession,
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

    async endSession(input: EndTableSessionInput) {
        try {
            const session = await this.repository.findOne({
                where: { id: input.id },
                relations: ['customer', 'table']
            });

            if (!session) {
                return this.formatErrors(GlobalError.RECORD_NOT_FOUND, 'Table session not found');
            }

            if (session.status !== TableSessionStatus.ACTIVE) {
                return this.formatErrors(GlobalError.INVALID_INPUT, 'Session is not active');
            }

            const endTime = new Date();
            const startTime = new Date(session.startTime);
            const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            
            // Get table category to calculate rate
            const table = await this.context.table.repository.findOne({
                where: { id: session.tableId },
                relations: ['category']
            });

            const hourlyRate = table.category.hourlyRate;
            const totalAmount = Math.ceil(durationInHours * hourlyRate); // Round up to next hour

            // Execute all operations within a transaction
            const result = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                // Update session
                session.totalAmount = totalAmount;
                session.status = TableSessionStatus.COMPLETED;
                const updatedSession = await transactionalEntityManager.save(session);

                // Generate invoice for the completed session
                const invoice = transactionalEntityManager.create(this.context.invoice.repository.target, {
                    customerId: session.customerId,
                    tableSessionId: session.id,
                    totalAmount: totalAmount,
                    paidAmount: 0,
                    remainingAmount: totalAmount,
                    status: InvoiceStatus.UNPAID,
                    notes: `Table session from ${startTime.toLocaleString()} to ${endTime.toLocaleString()}`
                });

                await transactionalEntityManager.save(invoice);

                return updatedSession;
            });

            if (result && result.error && result.error.length > 0) {
                console.log('transaction.error: ', result.error);
                return this.formatErrors([GlobalError.EXCEPTION], result.error)
            }

            return this.successResponse(result);
        } catch (error: any) {
            return this.formatErrors(GlobalError.INTERNAL_SERVER_ERROR, error.message);
        }
    }

    async cancelSession(id: string) {
        try {
            const session = await this.repository.findOne({
                where: { id },
                relations: ['customer', 'table']
            });

            if (!session) {
                return this.formatErrors(GlobalError.RECORD_NOT_FOUND, 'Table session not found');
            }

            if (session.status !== TableSessionStatus.ACTIVE) {
                return this.formatErrors(GlobalError.INVALID_INPUT, 'Session is not active');
            }

            // Update session status
            session.status = TableSessionStatus.CANCELLED;
            const updatedSession = await this.repository.save(session);

            return this.successResponse(updatedSession);
        } catch (error: any) {
            return this.formatErrors(GlobalError.INTERNAL_SERVER_ERROR, error.message);
        }
    }
}
