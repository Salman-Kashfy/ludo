import {Entity, PrimaryGeneratedColumn, Index, Column, BaseEntity, JoinColumn, ManyToOne} from 'typeorm';
import { IsNumber, Min, IsOptional } from 'class-validator';
import { CategoryPriceUnit } from '../../schema/category/types';
import { Category } from './Category';

@Entity({ name: 'category_prices' })
@Index(['categoryId', 'duration', 'unit'], { unique: true })
export class CategoryPrice extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column({ name: 'category_id' })
    @Index()
    categoryId: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    @IsNumber()
    @Min(0)
    price: number;

    @Column({ type: 'enum', enum: CategoryPriceUnit })
    unit: CategoryPriceUnit;

    @Column('integer',{ name: 'duration' })
    @IsNumber()
    @Min(0)
    duration: number;

    @Column('integer',{ name: 'free_mins', nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    freeMins?: number;

    @Column({ name: 'currency_name', default: 'PKR' })
    @Index()
    currencyName: string;   

    /**
     * Relations
     */
    @ManyToOne(() => Category, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'category_id' })
    category: Category;

}