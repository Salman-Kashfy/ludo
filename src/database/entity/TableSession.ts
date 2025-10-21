import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    Index,
  } from 'typeorm';
  import { Customer } from './Customer';
  import { Table } from './Table';

export enum TableSessionStatus {
    BOOKED = 'booked',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}
  
  @Entity({ name: 'table_sessions' })
  export class TableSession {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column({ name: 'customer_id' })
    @Index()
    customerId: number;

    @Column({ name: 'table_id' })
    @Index()
    tableId: number;
  
    @Column({ type: 'timestamp', name: 'start_time', nullable: true })
    startTime: Date | null;
  
    @Column({ type: 'timestamp', name: 'end_time', nullable: true })
    endTime: Date | null;
  
  
    @Column({ type: 'enum', enum: TableSessionStatus, default: TableSessionStatus.BOOKED })
    status: TableSessionStatus;
  
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
 
     @ManyToOne(() => Table, { nullable: false })
     @JoinColumn({ name: 'table_id' })
     table: Table;
  }
  