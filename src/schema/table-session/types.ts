import { TableSessionStatus } from '../../database/entity/TableSession';
import { PaymentMethodInput } from "../payment/types";

export interface TableSessionInput {
    id?: string
    customerId: number
    tableId: number
    startTime?: string
    endTime?: string
    totalAmount?: number
    status?: TableSessionStatus
}

export interface StartTableSessionInput {
    companyUuid: string
    tableSessionUuid: string
}

export interface EndTableSessionInput {
    id: string
}

export interface TableSessionFilter {
    searchText?: string
    customerId?: number
    tableId?: number
    status?: TableSessionStatus
    dateFrom?: string
    dateTo?: string
}

export interface BookTableSessionInput {
    customerUuid: string;
    tableUuid: string;
    hours: number;
    companyUuid: string;
    paymentMethod: PaymentMethodInput;
}
