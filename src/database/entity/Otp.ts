import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, Index} from 'typeorm';
import {OtpChannel, OtpType} from "../../schema/otp/enum";

@Entity('otp')
export class Otp extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column({ name: 'identifier' })
    identifier: string;

    @Column({ name: 'code', length: 10 })
    code: string;

    @Column({ name: 'type' })
    type: OtpType;

    @Column({ name: 'channel' })
    @Index()
    channel: OtpChannel;

    @Column({ name: 'is_used', type: 'boolean', default: false })
    isUsed: boolean;

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP(6)',
        name: 'created_at',
    })
    createdAt!: Date;

    /**
     * DB last update time.
     */
    @UpdateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
        name: 'updated_at',
    })
    updatedAt!: Date;
}