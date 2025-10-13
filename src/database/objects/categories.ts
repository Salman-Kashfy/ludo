import {Status} from "../entity/root/enums";

interface CategoryInput {
    categoryId:number
}
export const categories = (input:CategoryInput) => [
        {
            id: input.categoryId,
            name: 'Regular',
            hourlyRate: 500,
            currencyName: 'PKR'
        },
        {
            id: 2,
            name: 'Special',
            hourlyRate: 1000,
            currencyName: 'PKR'
        },
        {
            id: 3,
            name: 'Premium',
            hourlyRate: 2000,
            currencyName: 'PKR'
        },
]
