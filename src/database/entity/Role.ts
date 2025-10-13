import { Entity, PrimaryColumn, Column, BaseEntity, OneToMany, Index } from 'typeorm';
import { RolePermission } from './RolePermission';
import {Roles} from "./root/enums";
import {RoleNames} from "./root/enums";

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
    @PrimaryColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column({ name: 'name', enum: Roles })
    name!: Roles;

    @Column({ name: 'display_name', enum: RoleNames })
    displayName!: RoleNames;

    /**
     * Relations
     */
    @OneToMany((type) => RolePermission, (rolesPermissions) => rolesPermissions.role)
    rolesPermissions!: RolePermission[];
}
