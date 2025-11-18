import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, Min } from 'class-validator';
import { Customer } from './Customer';
import { Table } from './Table';
import { PlayerTournamentStatus } from '../../schema/tournament-player/playerStatus';

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

    @Column({ 
        type: 'enum', 
        enum: PlayerTournamentStatus, 
        default: PlayerTournamentStatus.ACTIVE 
    })
    status!: PlayerTournamentStatus;

    @Column({ name: 'eliminated_in_round', type: 'int', nullable: true })
    @IsInt()
    @Min(1)
    eliminatedInRound?: number;

    @Column({ name: 'final_position', type: 'int', nullable: true })
    @IsInt()
    @Min(1)
    finalPosition?: number;

    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP(6)',
        name: 'created_at',
    })
    createdAt!: Date;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer!: Customer;
}
