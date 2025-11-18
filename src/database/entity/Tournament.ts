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
import { Length, IsDateString, IsInt, Min, IsNumber } from 'class-validator';
import { TournamentStatus, TournamentFormat } from '../../schema/tournament/types';
import { User } from './User';
import { Company } from './Company';
import { Category } from './Category';
import { Customer } from './Customer';

@Entity({ name: 'tournaments' })
export class Tournament extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column()
    @Length(1, 100)
    name!: string;

    @Column({ type: 'date' })
    date!: string; // e.g. "2025-11-11"

    @Column({ name: 'start_time', type: 'time' })
    startTime!: string; // e.g. "20:07:00"

    @Column('decimal', { name:'entry_fee', precision: 10, scale: 2, default: 0 })
    @IsNumber()
    @Min(0)
    entryFee!: number;

    @Column('decimal', { name:'prize_pool', precision: 10, scale: 2, default: 0 })
    @IsNumber()
    @Min(0)
    prizePool!: number;

    @Column({ name: 'currency_name', default: 'PKR' })
    currencyName: string;  

    @Column({ name: 'player_limit', type: 'int' })
    @IsInt()
    @Min(2)
    playerLimit!: number;

    @Column({ name: 'player_count', type: 'int', default: 0 })
    @IsInt()
    @Min(0)
    playerCount!: number;

    @Column({ 
        type: 'enum', 
        enum: TournamentFormat, 
        default: TournamentFormat.GROUP_STAGE 
    })
    format!: TournamentFormat;

    @Column({ name: 'players_per_group', type: 'int', nullable: true })
    @IsInt()
    @Min(2)
    playersPerGroup?: number;

    @Column({ name: 'number_of_rounds', type: 'int', nullable: true })
    @IsInt()
    @Min(1)
    numberOfRounds?: number;

    @Column({ name: 'current_round', type: 'int', default: 0 })
    @IsInt()
    @Min(0)
    currentRound!: number;

    @Column({ name: 'winner_customer_id', nullable: true })
    @Index()
    winnerCustomerId?: number;

    @Column({ type: 'enum', enum: TournamentStatus, default: TournamentStatus.UPCOMING })
    status?: TournamentStatus;

    @Column({ name: 'company_id' })
    @Index()
    companyId!: number;

    @Column({ name: 'category_id' })
    @Index()
    categoryId!: number;

    @Column({ name: 'created_by_id' })
    createdById!: number;

    @Column({ name: 'last_updated_by_id', nullable: true })
    lastUpdatedById?: number;

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

    /**
     * Relations
     */
    @ManyToOne(() => Category)
    @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
    category!: Category;
    
    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company!: Company;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy!: User;

    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'last_updated_by_id', referencedColumnName: 'id' })
    lastUpdatedBy?: User;

    @ManyToOne(() => Customer, { nullable: true })
    @JoinColumn({ name: 'winner_customer_id' })
    winner?: Customer;
}
