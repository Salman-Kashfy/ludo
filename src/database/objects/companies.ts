import {Status} from "../entity/root/enums";

interface CompanyInput {
    companyId: number
}

export const companies = (input: CompanyInput) => [
    {
        id: input.companyId,
        name: 'Ludo Club',
        description: 'Default company for ludo club',
        email: 'info@corefluence.com',
        phoneCode: '92',
        phoneNumber: '3001234567',
        status: Status.ACTIVE,
    },
]
