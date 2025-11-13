import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tournament } from './Tournament';
import { Customer } from './Customer';

@Entity({ name: 'tournament_players' })
export class TournamentPlayer extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'tournament_id', type: 'int' })
    @Index()
    tournamentId!: number;

    @Column({ name: 'customer_id', type: 'int' })
    @Index()
    customerId!: number;

    @ManyToOne(() => Tournament, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'tournament_id' })
    tournament!: Tournament;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer!: Customer;
}
