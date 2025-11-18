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

@Entity({ name: 'tournament_rounds' })
@Index(['tournamentId', 'roundNumber'], { unique: true })
export class TournamentRound extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'tournament_id' })
    @Index()
    tournamentId!: number;

    @Column({ name: 'round_number', type: 'int' })
    @Index()
    @IsInt()
    @Min(1)
    roundNumber!: number;

    @Column({ name: 'round_name', nullable: true })
    roundName?: string;

    @Column({ name: 'players_count', type: 'int' })
    @IsInt()
    @Min(1)
    playersCount!: number;

    @Column({ name: 'groups_count', type: 'int', default: 1 })
    @IsInt()
    @Min(1)
    groupsCount!: number;

    @Column({ name: 'matches_count', type: 'int', default: 0 })
    @IsInt()
    @Min(0)
    matchesCount!: number;

    @Column({ name: 'completed_matches', type: 'int', default: 0 })
    @IsInt()
    @Min(0)
    completedMatches!: number;

    @Column({ name: 'is_completed', type: 'boolean', default: false })
    isCompleted!: boolean;

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
}

