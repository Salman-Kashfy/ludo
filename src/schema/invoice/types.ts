export interface InvoiceFilter {
    searchText?: string;
    customerId?: number;
    status?: string;
}

export interface CreateInvoiceInput {
    customerId: number;
    totalAmount: number;
    paidAmount?: number;
    remainingAmount?: number;
    status?: string;
    notes?: string;
    tableSessionId?: number;
}

export interface UpdateInvoiceInput {
    id: string;
    customerId?: number;
    totalAmount?: number;
    paidAmount?: number;
    remainingAmount?: number;
    status?: string;
    notes?: string;
    tableSessionId?: number;
}

export interface UpdateInvoiceStatusInput {
    id: string;
    status: string;
}

export interface InvoicePayload {
    data?: any;
    errors?: string[];
    status: boolean;
    errorMessage?: string;
}

export interface InvoicesPayload {
    list: any[];
    paging: {
        page: number;
        limit: number;
        totalPages: number;
        totalResultCount: number;
    };
}

export interface SaveInvoicePayload {
    data?: any;
    errors?: string;
    status: boolean;
    errorMessage?: string;
}
