import {Entity, Column, BaseEntity, Index, OneToMany, PrimaryColumn} from 'typeorm';
import { Length } from 'class-validator';
import { RolePermission } from './RolePermission';

@Entity({ name: 'permissions' })
export class Permission extends BaseEntity {
    @PrimaryColumn()
    id!: number;

    @Column({ name: 'name' })
    @Length(1, 250)
    @Index()
    name!: string;

    @OneToMany((type) => RolePermission, (rolesPermissions) => rolesPermissions.permission)
    rolesPermissions!: RolePermission[];
}