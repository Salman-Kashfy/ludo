import { CategoryPriceUnit } from '../../schema/category/types';
import { CategoryPrice as CategoryPriceEntity } from '../entity/CategoryPrice';

interface CategoryPriceInput {
    regularCategoryId: number
    specialCategoryId: number
    premiumCategoryId: number
}

export const categoryPrices = (input: CategoryPriceInput) => {
    const prices: Partial<CategoryPriceEntity>[] = [];
    
    // Define pricing tiers for each category
    const pricingTiers = [
        { duration: 15, unit: CategoryPriceUnit.MINUTES, regularPrice: 125, specialPrice: 250, premiumPrice: 500 },
        { duration: 30, unit: CategoryPriceUnit.MINUTES, regularPrice: 250, specialPrice: 500, premiumPrice: 1000 },
        { duration: 45, unit: CategoryPriceUnit.MINUTES, regularPrice: 375, specialPrice: 750, premiumPrice: 1500 },
        { duration: 1, unit: CategoryPriceUnit.HOURLY, regularPrice: 500, specialPrice: 1000, premiumPrice: 2000 }
    ];

    // Generate prices for Regular category
    pricingTiers.forEach(tier => {
        prices.push({
            categoryId: input.regularCategoryId,
            price: tier.regularPrice,
            unit: tier.unit,
            duration: tier.duration,
            currencyName: 'PKR'
        });
    });

    // Generate prices for Special category
    pricingTiers.forEach(tier => {
        prices.push({
            categoryId: input.specialCategoryId,
            price: tier.specialPrice,
            unit: tier.unit,
            duration: tier.duration,
            currencyName: 'PKR'
        });
    });

    // Generate prices for Premium category
    pricingTiers.forEach(tier => {
        prices.push({
            categoryId: input.premiumCategoryId,
            price: tier.premiumPrice,
            unit: tier.unit,
            duration: tier.duration,
            currencyName: 'PKR'
        });
    });

    return prices;
};
