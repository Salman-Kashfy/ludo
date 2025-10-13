export const PERMISSIONS = {
    ALL: { ID: 1, NAME: 'all' },
    CATEGORY: {
        CREATE: { ID: 2, NAME: 'category:create' },
        UPDATE: { ID: 3, NAME: 'category:update' },
        VIEW:   { ID: 4, NAME: 'category:view' },
        DELETE: { ID: 5, NAME: 'category:delete' },
    },
    TABLE: {
        CREATE: { ID: 6, NAME: 'table:create' },
        UPDATE: { ID: 7, NAME: 'table:update' },
        VIEW:   { ID: 8, NAME: 'table:view' },
        DELETE: { ID: 9, NAME: 'table:delete' },
    },
    SHIFT: {
        UPSERT: { ID: 10, NAME: 'shift:upsert' },
        VIEW:   { ID: 11, NAME: 'shift:view' },
        DELETE: { ID: 12, NAME: 'shift:delete' },
    },
    CUSTOMER: {
        CREATE: { ID: 13, NAME: 'customer:create' },
        UPDATE: { ID: 14, NAME: 'customer:update' },
        VIEW:   { ID: 15, NAME: 'customer:view' },
        DELETE: { ID: 16, NAME: 'customer:delete' },
    },
    TABLE_SESSION: {
        CREATE: { ID: 17, NAME: 'table_session:create' },
        UPDATE: { ID: 18, NAME: 'table_session:update' },
        VIEW:   { ID: 19, NAME: 'table_session:view' },
        DELETE: { ID: 20, NAME: 'table_session:delete' },
    },
    PAYMENT: {
        CREATE: { ID: 21, NAME: 'payment:create' },
        UPDATE: { ID: 22, NAME: 'payment:update' },
        VIEW:   { ID: 23, NAME: 'payment:view' },
        DELETE: { ID: 24, NAME: 'payment:delete' },
    },
};