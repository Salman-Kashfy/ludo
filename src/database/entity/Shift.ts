import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    BaseEntity,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { Length } from 'class-validator';
import { Status } from './root/enums';
import { User } from './User';

@Entity({ name: 'shifts' })
export class Shift extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;


    @Column()
    @Length(1, 100)
    name!: string;

    @Column({ name: 'start_time', type: 'time' })
    startTime!: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime!: string;

    @Column({ name: 'days', type: 'json' })
    days!: string[]; // Array of days like ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
    status!: Status;

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
}
