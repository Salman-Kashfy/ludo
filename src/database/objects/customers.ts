interface CustomerInput {
    customerId?: number
}

export const customers = (input: CustomerInput = {}) => [
    {
        id: input.customerId || 1,
        firstName: 'Salman',
        lastName: 'Kashfy',
        phoneCode: '92',
        phoneNumber: '3322278636'
    }
]
