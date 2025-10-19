import {Status} from "../entity/root/enums";

interface CompanyInput {
    companyId: number
    companyUuid: string
}

export const companies = (input: CompanyInput) => [
    {
        id: input.companyId,
        uuid: input.companyUuid,
        name: 'Ludo Club',
        description: 'Default company for ludo club',
        email: 'info@corefluence.com',
        phoneCode: '92',
        phoneNumber: '3001234567',
        status: Status.ACTIVE,
    },
]
