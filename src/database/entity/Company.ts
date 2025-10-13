import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity, UpdateDateColumn} from 'typeorm';
import { Length } from 'class-validator';
import {Status} from "./root/enums";

@Entity({ name: 'companies' })
export class Company extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column()
    @Length(1, 75)
    name!: string;

    @Column({ nullable: true })
    @Length(1, 250)
    description?: string;

    @Column()
    @Length(1, 100)
    email!: string;

    @Column({ nullable: true })
    logo?: string;

    @Column({name: 'phone_code', nullable: true})
    @Length(1, 4)
    phoneCode!: string;

    @Column({name: 'phone_number', nullable: true})
    @Length(1, 15)
    phoneNumber!: string;

    @Column({ enum: Status, default: Status.ACTIVE })
    status!: Status;

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
}