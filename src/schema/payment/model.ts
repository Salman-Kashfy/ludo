import BaseModel from '../baseModel';
import { Payment as PaymentEntity } from '../../database/entity/Payment';
import Context from "../context";
import { GlobalError } from "../root/enum";
import { isEmpty } from "lodash";
import { PagingInterface } from "../../interfaces";
import { PaymentPayload, TableSessionBillingInput } from './types';
import { PaymentStatus } from './types';

export default class Payment extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(PaymentEntity), context);
    }

    async index(paging: PagingInterface, params: any) {
        const _query = this.repository.createQueryBuilder('p')
            .leftJoinAndSelect('p.customer', 'customer')
            .leftJoinAndSelect('p.invoice', 'invoice');

        if (!isEmpty(params.searchText)) {
            _query.andWhere('(customer.firstName ILIKE :searchText OR customer.lastName ILIKE :searchText)', {
                searchText: `%${params.searchText}%`
            });
        }
        if (!isEmpty(params.customerId)) {
            _query.andWhere('p.customerId = :customerId', { customerId: params.customerId });
        }
        if (!isEmpty(params.status)) {
            _query.andWhere('p.status = :status', { status: params.status });
        }
        if (!isEmpty(params.method)) {
            _query.andWhere('p.method = :method', { method: params.method });
        }

        _query.orderBy('p.createdAt', 'DESC');

        return await this.paginator(_query, paging);
    }

    async show(id: string) {
        try {
            const data = await this.repository.findOne({
                where: { id },
                relations: ['customer', 'invoice']
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

    async refundValidate(input: { id: string; refundNote: string; refundAmount?: number }) {
        let errors: any = [], errorMessage = null, data: any = {};

        if (isEmpty(input.id)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Payment ID is required';
        }

        if (isEmpty(input.refundNote)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Refund note is required';
        }

        if (errors.length > 0) {
            return {
                data: null,
                status: false,
                errors,
                errorMessage
            };
        }

        // Check if original payment exists
        data.originalPayment = await this.repository.findOne({
            where: { id: input.id },
            relations: ['customer', 'invoice']
        });

        if (!data.originalPayment) {
            errors.push(GlobalError.RECORD_NOT_FOUND);
            errorMessage = 'Original payment not found';
        } else if (data.originalPayment.status === PaymentStatus.REFUNDED) {
            errors.push(GlobalError.INVALID_INPUT);
            errorMessage = 'Payment is already fully refunded';
        } else {
            // Calculate total refunded amount so far
            const totalRefunded = await this.repository
                .createQueryBuilder('payment')
                .select('SUM(payment.amount)', 'total')
                .where('payment.invoiceId = :invoiceId', { invoiceId: data.originalPayment.invoiceId })
                .andWhere('payment.status IN (:...statuses)', { statuses: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED] })
                .getRawOne();

            const refundedSoFar = parseFloat(totalRefunded?.total || '0');
            const refundAmount = input.refundAmount || data.originalPayment.amount;
            const remainingAmount = data.originalPayment.amount - refundedSoFar;

            if (refundAmount > remainingAmount) {
                errors.push(GlobalError.INVALID_INPUT);
                errorMessage = `Refund amount (${refundAmount}) cannot exceed remaining amount (${remainingAmount})`;
            }

            if (refundAmount <= 0) {
                errors.push(GlobalError.INVALID_INPUT);
                errorMessage = 'Refund amount must be greater than 0';
            }
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

    async refund(input: { id: string; refundNote: string; refundAmount?: number }) {
        const validation = await this.refundValidate(input);
        if (!validation.status) {
            return validation;
        }

        try {
            const { originalPayment } = validation.data;
            const refundAmount = input.refundAmount || originalPayment.amount;

            // Execute refund within a transaction
            const result = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                // Create new refund payment record
                const refundPayment = transactionalEntityManager.create(this.repository.target, {
                    customerId: originalPayment.customerId,
                    invoiceId: originalPayment.invoiceId,
                    amount: refundAmount,
                    method: originalPayment.method,
                    status: PaymentStatus.REFUNDED,
                    refundNote: input.refundNote,
                    refundedAt: new Date()
                });

                const savedRefundPayment = await transactionalEntityManager.save(refundPayment);

                // Calculate total refunded amount for this invoice
                const totalRefunded = await transactionalEntityManager
                    .createQueryBuilder(this.repository.target, 'payment')
                    .select('SUM(payment.amount)', 'total')
                    .where('payment.invoiceId = :invoiceId', { invoiceId: originalPayment.invoiceId })
                    .andWhere('payment.status = :status', { status: PaymentStatus.REFUNDED })
                    .getRawOne();

                const totalRefundedAmount = parseFloat(totalRefunded?.total || '0');

                // Update invoice status based on total refunded amount
                if (originalPayment.invoice) {
                    let invoiceStatus = 'UNPAID';
                    if (totalRefundedAmount >= originalPayment.amount) {
                        invoiceStatus = 'CANCELLED';
                    } else if (totalRefundedAmount > 0) {
                        invoiceStatus = 'PARTIALLY_PAID';
                    }

                    await transactionalEntityManager.update(
                        this.context.invoice.repository.target,
                        originalPayment.invoice.id,
                        {
                            status: invoiceStatus,
                            paidAmount: originalPayment.amount - totalRefundedAmount,
                            remainingAmount: totalRefundedAmount
                        }
                    );
                }

                return savedRefundPayment;
            });

            return this.successResponse(result);
        } catch (error: any) {
            return this.formatErrors(GlobalError.INTERNAL_SERVER_ERROR, error.message);
        }
    }

    async createPayment(
        transactionalEntityManager: any,
        input: PaymentPayload & { calculateTax?: boolean }
    ) {
        try {
            // Automatically calculate tax if requested
            if (input.calculateTax && input.method) {
                const taxRate = this.getTaxRate(input.method);
                const taxAmount = (input.amount || 0) * (taxRate / 100);
                input.taxRate = taxRate;
                input.taxAmount = taxAmount;
                input.totalAmount = (input.amount || 0) + taxAmount;
            }

            const payment = transactionalEntityManager.create(this.repository.target, input);
            const data = await transactionalEntityManager.save(payment);
            return this.successResponse(data);
        } catch (error: any) {
            return this.formatErrors(GlobalError.INTERNAL_SERVER_ERROR, error.message);
        }
    }

    // Helper function for tax rates
    getTaxRate(paymentMethod: string) {
        switch (paymentMethod) {
            case 'CARD':
                return 8;
            case 'CASH':
            case 'BANK_TRANSFER':
                return 15;
            default:
                return 0;
        }
    }

    async tableSessionBilling(input: TableSessionBillingInput) {
        try {
            const table = await this.context.table.repository.findOne({
                where: { uuid: input.tableUuid },
                relations: ['category']
            });

            if (!table) {
                return this.formatErrors(GlobalError.RECORD_NOT_FOUND, 'Table not found');
            }

            const categoryPrice = await this.context.categoryPrice.repository.findOne({
                where: { uuid: input.categoryPriceUuid },
            });

            if (!categoryPrice) {
                return this.formatErrors(GlobalError.RECORD_NOT_FOUND, 'Category price not found');
            }

            // Example tax calculation (15% by default)
            const taxRate = 15;
            const subtotal = categoryPrice.price;
            const taxAmount = subtotal * (taxRate / 100);
            const totalAmount = subtotal + taxAmount;

            const billingPreview = {
                table: {
                    name: table.name,
                    category: {
                        name: table.category.name,
                    }
                },
                billing: {
                    unit: categoryPrice.unit,
                    duration: categoryPrice.duration,
                    currencyName: categoryPrice.currencyName,
                    subtotal,
                    taxRate,
                    taxAmount,
                    totalAmount,
                }
            };

            return this.successResponse(billingPreview);
        } catch (error: any) {
            return this.formatErrors(GlobalError.INTERNAL_SERVER_ERROR, error.message);
        }
    }

}
