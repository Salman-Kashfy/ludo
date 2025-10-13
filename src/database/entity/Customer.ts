import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
} from 'typeorm';
import { Length } from 'class-validator';

@Entity({ name: 'customers' })
export class Customer extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'first_name' })
    @Length(1, 50)
    firstName!: string;

    @Column({ name: 'last_name' })
    @Length(1, 50)
    lastName!: string;

    @Column({ name: 'phone_code', nullable: true })
    @Length(1, 4)
    phoneCode?: string;

    @Column({ name: 'phone_number', nullable: true })
    @Length(1, 15)
    phoneNumber?: string;

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
}
