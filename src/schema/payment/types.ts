// Enums
export enum PaymentStatus {
    SUCCESS = 'SUCCESS',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentScheme {
    CASH = 'CASH',
    CARD = 'CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
}


// Interfaces
export interface PaymentInput {
    id?: string
    customerId: number
    invoiceId?: string
    amount: number
    method: PaymentMethod
    status?: PaymentStatus
    refundNote?: string
}

export interface RefundPaymentInput {
    id: string
    refundNote: string
    refundAmount?: number
}

export interface PaymentFilter {
    searchText?: string
    customerId?: number
    status?: PaymentStatus
    method?: PaymentMethod
}

export interface TableSessionBillingInput {
    tableUuid: string
    customerUuid: string
    hours: number
    companyUuid: string
    categoryPriceUuid: string
}

export interface PaymentPayload {
    customerId: string;
    invoiceId: string;
    amount: number;
    method: string;
    status?: string;
    refundNote?: string;
    // Add tax-related fields
    taxRate?: number;
    taxAmount?: number;
    totalAmount?: number;
}

export interface PaymentMethodInput {
    paymentScheme: PaymentScheme
    name?: string
    sourceId?: string
}