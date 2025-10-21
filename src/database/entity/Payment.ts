import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Index
  } from 'typeorm';
  import { Invoice } from './Invoice';
  import { Customer } from './Customer';
  import { TableSession } from './TableSession';

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
    COMPLETED = 'COMPLETED',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum BillingStatus {
    MINIMUM_PAID = 'MINIMUM_PAID',
    FULLY_PAID = 'FULLY_PAID',
}
  
  @Entity({ name: 'payments' })
  export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'customer_id' })
    @Index()
    customerId: number;

    @Column({ name: 'invoice_id', nullable: true })
    @Index()
    invoiceId: string | null;

    @Column({ name: 'table_session_id', nullable: true })
    @Index()
    tableSessionId: number | null;
  
    @Column({ type: 'numeric', precision: 10, scale: 2 })
    amount: number;
  
    @Column({
      type: 'enum',
      enum: PaymentMethod,
      default: PaymentMethod.CASH,
    })
    method: PaymentMethod;

    @Column({
      type: 'enum',
      enum: PaymentStatus,
      default: PaymentStatus.COMPLETED,
    })
    status: PaymentStatus;

    @Column({
      type: 'enum',
      enum: BillingStatus,
      nullable: true,
    })
    billingStatus: BillingStatus | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    refundNote: string | null;

    @Column({ type: 'timestamp', nullable: true })
    refundedAt: Date | null;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    /**
     * Relations
     */

    @ManyToOne(() => Invoice)
    @JoinColumn({ name: 'invoice_id' })
    invoice: Invoice;
  
    @ManyToOne(() => Customer, { nullable: false })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => TableSession, { nullable: true })
    @JoinColumn({ name: 'table_session_id' })
    tableSession: TableSession | null;
  }
  