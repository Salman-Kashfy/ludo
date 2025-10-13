import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';
import { Length, IsNumber, Min } from 'class-validator';

@Entity({ name: 'categories' })
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Length(1, 75)
    name!: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    @IsNumber()
    @Min(0)
    hourlyRate!: number;

    @Column({ default: 'PKR' })
    currencyName!: string;
}
