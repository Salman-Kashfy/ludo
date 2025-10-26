import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
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
  @Index(['tableId', 'status'], { unique: true, where: "status IN ('booked', 'active')" })
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
  
    @Column({ type: 'timestamptz', name: 'start_time', default: () => 'CURRENT_TIMESTAMP(6)' })
    startTime: Date | null;
  
    @Column({ type: 'enum', enum: TableSessionStatus, default: TableSessionStatus.BOOKED })
    status: TableSessionStatus;

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
  