interface CustomerInput {
    customerId?: number
    companyId: number
}

export const customers = (input: CustomerInput) => [
    {
        id: input.customerId || 1,
        firstName: 'Salman',
        lastName: 'Kashfy',
        phoneCode: '92',
        phoneNumber: '3322278636',
        companyId: input.companyId,
    },
    {
        id: 2,
        firstName: 'Mohammad',
        lastName: 'Amir',
        phoneCode: '92',
        phoneNumber: '3082643777',
        companyId: input.companyId,
    }
]
