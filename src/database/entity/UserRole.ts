import { Entity, BaseEntity, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'user_roles' })
export class UserRole extends BaseEntity {

    @PrimaryColumn({ name: 'user_id' })
    @Index()
    userId!: number;

    @PrimaryColumn({ name: 'role_id' })
    @Index()
    roleId!: number;
}