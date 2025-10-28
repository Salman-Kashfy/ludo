export const PERMISSIONS = {
    ALL: { ID: 1, NAME: 'all' },
    CATEGORY: {
        UPSERT: { ID: 2, NAME: 'category:upsert' },
        VIEW:   { ID: 3, NAME: 'category:view' },
        DELETE: { ID: 4, NAME: 'category:delete' },
    },
    TABLE: {
        UPSERT: { ID: 5, NAME: 'table:upsert' },
        VIEW:   { ID: 6, NAME: 'table:view' },
        DELETE: { ID: 7, NAME: 'table:delete' },
    },
    SHIFT: {
        UPSERT: { ID: 8, NAME: 'shift:upsert' },
        VIEW:   { ID: 9, NAME: 'shift:view' },
        DELETE: { ID: 10, NAME: 'shift:delete' },
    },
    CUSTOMER: {
        UPSERT: { ID: 11, NAME: 'customer:upsert' },
        VIEW:   { ID: 12, NAME: 'customer:view' },
        DELETE: { ID: 13, NAME: 'customer:delete' },
    },
    TABLE_SESSION: {
        UPSERT: { ID: 14, NAME: 'table_session:upsert' },
        VIEW:   { ID: 15, NAME: 'table_session:view' },
        DELETE: { ID: 16, NAME: 'table_session:delete' },
    },
    PAYMENT: {
        UPSERT: { ID: 17, NAME: 'payment:upsert' },
        VIEW:   { ID: 18, NAME: 'payment:view' },
        DELETE: { ID: 19, NAME: 'payment:delete' },
    },
};