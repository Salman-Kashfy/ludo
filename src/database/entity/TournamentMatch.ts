import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { IsInt, Min } from 'class-validator';
import { Tournament } from './Tournament';
import { TournamentRound } from './TournamentRound';
import { Table } from './Table';
import { Customer } from './Customer';
import { MatchStatus } from '../../schema/tournament/types';

@Entity({ name: 'tournament_matches' })
@Index(['tournamentId', 'roundNumber', 'matchNumber'], { unique: true })
export class TournamentMatch extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'tournament_id' })
    @Index()
    tournamentId!: number;

    @Column({ name: 'round_id' })
    @Index()
    roundId!: number;

    @Column({ name: 'round_number', type: 'int' })
    @Index()
    @IsInt()
    @Min(1)
    roundNumber!: number;

    @Column({ name: 'match_number', type: 'int' })
    @IsInt()
    @Min(1)
    matchNumber!: number;

    @Column({ name: 'group_number', type: 'int', nullable: true })
    @IsInt()
    @Min(1)
    groupNumber?: number;

    @Column({ name: 'table_id', nullable: true })
    @Index()
    tableId?: number;

    @Column({ 
        type: 'enum', 
        enum: MatchStatus, 
        default: MatchStatus.PENDING 
    })
    status!: MatchStatus;

    @Column({ name: 'winner_customer_id', nullable: true })
    @Index()
    winnerCustomerId?: number;

    @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
    startedAt?: Date;

    @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
    completedAt?: Date;

    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP(6)',
        name: 'created_at',
    })
    createdAt!: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
        name: 'updated_at',
    })
    updatedAt!: Date;

    @ManyToOne(() => Tournament, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'tournament_id' })
    tournament!: Tournament;

    @ManyToOne(() => TournamentRound, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'round_id' })
    round!: TournamentRound;

    @ManyToOne(() => Table, { nullable: true })
    @JoinColumn({ name: 'table_id' })
    table?: Table;

    @ManyToOne(() => Customer, { nullable: true })
    @JoinColumn({ name: 'winner_customer_id' })
    winner?: Customer;
}

