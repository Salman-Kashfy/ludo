import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    BaseEntity,
    UpdateDateColumn, ManyToOne, JoinColumn, Index
} from 'typeorm';
import { Length, IsEmail } from 'class-validator';
import {GenderType, Status} from './root/enums';
import { Role } from "./Role";
import { Company } from "./Company";

@Entity({ name: 'users' })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column('uuid', { name: 'role_id' })
    @Index()
    roleId!: number;

    @Column({ name: 'first_name' })
    @Length(1, 30)
    firstName!: string;

    @Column({ name: 'middle_name', nullable: true })
    @Length(1, 30)
    middleName?: string;

    @Column({ name: 'last_name', nullable: true })
    @Length(1, 30)
    lastName?: string;

    @Column()
    @IsEmail()
    email!: string;

    @Column({ nullable: true })
    @Length(1)
    password!: string;

    @Column({ name: 'country_id', nullable: true })
    countryId: number;

    @Column({ name: 'company_id', nullable: true })
    @Index()
    companyId?: number;

    @Column({name: 'phone_code', nullable: true})
    @Length(1, 4)
    phoneCode: string;

    @Column({name: 'phone_number', nullable: true})
    @Length(1, 15)
    phoneNumber: string;

    @Column({
        name: 'gender',
        type: 'enum',
        enum: GenderType,
        nullable: true,
    })
    gender!: GenderType;

    @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
    status!: Status;

    @Column({ name: 'photo', nullable: true })
    photo?: string;

    @Column('uuid', { name: 'invite_link', nullable: true })
    inviteLink: string;

    @Column({ name: 'invite_expiry', nullable: true })
    inviteExpiry: Date;

    @Column({name: 'biometric_user_id', nullable: true})
    biometricUserId?: string;

    @Column({ name: 'created_by_id', nullable: true })
    createdById!: number;

    @Column({ name:'last_updated_by_id', nullable: true })
    lastUpdatedById: number;

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

    @Column({ name: 'is_sys_admin', default: false })
    isSysAdmin!: boolean;

    /**
     * Relations
     */

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role!: Role;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy!: User;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'last_updated_by_id', referencedColumnName: 'id' })
    lastUpdatedBy!: User;

    @ManyToOne(() => Company, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
    company?: Company;

}
