import { PaymentMethod, PaymentStatus } from '../../database/entity/Payment';

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
