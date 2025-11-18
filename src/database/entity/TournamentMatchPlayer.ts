import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    BaseEntity,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { IsInt, Min } from 'class-validator';
import { TournamentMatch } from './TournamentMatch';
import { TournamentPlayer } from './TournamentPlayer';

@Entity({ name: 'tournament_match_players' })
@Index(['matchId', 'tournamentPlayerId'], { unique: true })
export class TournamentMatchPlayer extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'match_id' })
    @Index()
    matchId!: number;

    @Column({ name: 'tournament_player_id' })
    @Index()
    tournamentPlayerId!: number;

    @Column({ name: 'position', type: 'int', nullable: true })
    @IsInt()
    @Min(1)
    position?: number;

    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP(6)',
        name: 'created_at',
    })
    createdAt!: Date;

    @ManyToOne(() => TournamentMatch, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'match_id' })
    match!: TournamentMatch;

    @ManyToOne(() => TournamentPlayer, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'tournament_player_id' })
    tournamentPlayer!: TournamentPlayer;
}

