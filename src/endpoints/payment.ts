import { Response } from 'express';
import Context from '../schema/context';
import { TableSessionBillingInput } from '../schema/payment/types';
import connection from '../database/connection';
import schema from "../shared/directives/loadSchema";
import { accessRulesByRoleHierarchy } from '../shared/lib/DataRoleUtils';

export const tableSessionBilling = async (req: any, res: Response) => {
    try {
        const context = req.context as Context;
        const input: TableSessionBillingInput = req.body;

        if (!input.tableUuid || !input.customerUuid || !input.hours || !input.companyUuid) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: tableUuid, customerUuid, hours, companyUuid',
                errors: ['INVALID_INPUT']
            });
        }

        const ctx = Context.getInstance(connection,schema,req);
        if(!await accessRulesByRoleHierarchy(ctx, { companyUuid: input.companyUuid })) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden',
                errors: ['FORBIDDEN']
            });
        }

        if (input.hours < 1) {
            return res.status(400).json({
                success: false,
                message: 'Hours must be at least 1',
                errors: ['INVALID_INPUT']
            });
        }

        // Process table session billing
        const result = await context.payment.tableSessionBilling(input);

        if (!result.status) {
            return res.status(400).json({
                success: false,
                message: (result as any).errorMessage || 'Billing processing failed',
                errors: (result as any).errors || ['UNKNOWN_ERROR']
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Retrieved successfully',
            data: result.data
        });

    } catch (error: any) {
        console.error('Table session billing error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: ['INTERNAL_SERVER_ERROR']
        });
    }
};
