import {Entity, PrimaryGeneratedColumn, Column, Index,BaseEntity, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import { Length } from 'class-validator';
import { Category } from './Category';
import { TableSession } from './TableSession';
import { Company } from './Company';

export enum TableStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    RESERVED = 'reserved'
}

@Entity({ name: 'tables' })
export class Table extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column()
    @Length(1, 75)
    name!: string;

    @Column({ name: 'category_id' })
    @Index()
    categoryId!: number;
    
    @Column({ name: 'company_id' })
    @Index()
    companyId!: number;

    @Column({ name: 'sort_no', type: 'int', nullable: true })
    sortNo?: number;

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

    @ManyToOne(() => Company, company => company.uuid)
    @JoinColumn({ name: 'company_id' })
    company!: Company;

    @OneToMany(() => TableSession, tableSession => tableSession.table)
    tableSessions?: TableSession[];
}
