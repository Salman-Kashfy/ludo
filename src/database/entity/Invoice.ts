import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Index,
  } from 'typeorm';
  import { Customer } from './Customer';
  import { TableSession } from './TableSession';

export enum InvoiceStatus {
    UNPAID = 'UNPAID',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
}
  
  @Entity({ name: 'invoices' })
  export class Invoice {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column({ name: 'customer_id' })
    @Index()
    customerId: number;

    @Column({ name: 'table_session_id', nullable: true })
    @Index()
    tableSessionId: number | null;

    @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2 })
    totalAmount: number;
  
    @Column({ name: 'paid_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
    paidAmount: number;
  
    @Column({ name: 'remaining_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
    remainingAmount: number;
  
    @Column({
      type: 'enum',
      enum: InvoiceStatus,
      default: InvoiceStatus.UNPAID,
    })
    status: InvoiceStatus;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    notes: string | null;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    /**
     * Relations
     */
    
    @ManyToOne(() => Customer, { nullable: false })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;
  
    @ManyToOne(() => TableSession, { nullable: true })
    @JoinColumn({ name: 'table_session_id' })
    tableSession: TableSession | null;
  }
  