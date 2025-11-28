import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './Customer';
import { Table } from './Table';
import { TournamentRound } from './TournamentRound';

@Entity({ name: 'tournament_round_players' })
@Index(['tournamentRoundId', 'customerId'], { unique: true })
export class TournamentRoundPlayer extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'tournament_round_id', type: 'int' })
    @Index()
    tournamentRoundId!: number;

    @Column({ name: 'customer_id', type: 'int' })
    @Index()
    customerId!: number;

    @Column({ name: 'table_id', type: 'int', nullable: true })
    @Index()
    tableId?: number;

    @Column({ name: 'is_winner', type: 'boolean', default: false })
    isWinner!: boolean;

    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP(6)',
        name: 'created_at',
    })
    createdAt!: Date;

    @ManyToOne(() => TournamentRound, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'tournament_round_id' })
    tournamentRound!: TournamentRound;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer!: Customer;

    @ManyToOne(() => Table, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'table_id' })
    table?: Table;
}
