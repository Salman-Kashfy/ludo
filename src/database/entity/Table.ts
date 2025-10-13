import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn} from 'typeorm';
import { Length } from 'class-validator';
import { Category } from './Category';

export enum TableStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    RESERVED = 'reserved'
}

@Entity({ name: 'tables' })
export class Table extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Length(1, 75)
    name!: string;

    @Column({ name: 'category_id' })
    categoryId!: number;

    @Column({ 
        type: 'enum', 
        enum: TableStatus, 
        default: TableStatus.AVAILABLE 
    })
    status!: TableStatus;

    /**
     * Relations
     */
    @ManyToOne(() => Category)
    @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
    category!: Category;
}
