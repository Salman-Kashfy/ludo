import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './Customer';
import { Table } from './Table';

@Entity({ name: 'tournament_players' })
@Index(['tournamentId', 'customerId'], { unique: true })
export class TournamentPlayer extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'tournament_id', type: 'int' })
    @Index()
    tournamentId!: number;

    @Column({ name: 'customer_id', type: 'int' })
    @Index()
    customerId!: number;

    @Column({ name: 'table_id', type: 'int' })
    @Index()
    tableId!: number;

    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP(6)',
        name: 'created_at',
    })
    createdAt!: Date;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer!: Customer;

    @ManyToOne(() => Table, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'table_id' })
    table!: Table;
}
