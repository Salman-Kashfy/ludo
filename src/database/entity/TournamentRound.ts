import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { IsInt, Min } from 'class-validator';
import { Tournament } from './Tournament';
import { TournamentRoundStatus } from '../../schema/tournament-round/types';

@Entity({ name: 'tournament_rounds' })
export class TournamentRound extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column({ name: 'tournament_id', type: 'int' })
    @Index()
    tournamentId!: number;

    @Column({ name: 'round', type: 'int' })
    @Index()
    round!: number;

    @Column({ name: 'player_count', type: 'int', default: 0 })
    @IsInt()
    @Min(0)
    playerCount!: number;

    @Column({ name: 'table_count', type: 'int', default: 0 })
    @IsInt()
    @Min(0)
    tableCount!: number;

    @Column({ type: 'enum', enum: TournamentRoundStatus, default: TournamentRoundStatus.UPCOMING })
    status: TournamentRoundStatus;

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

    @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
    startedAt?: Date;

    @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
    completedAt?: Date;

    /**
     * Relations
     */
    @ManyToOne(() => Tournament)
    @JoinColumn({ name: 'tournament_id', referencedColumnName: 'id' })
    tournament!: Tournament;
    
}
