import { Entity, BaseEntity, ManyToOne, JoinColumn, Index, PrimaryColumn } from 'typeorm';
import { Role } from './Role';
import { Permission } from './Permission';

@Entity({ name: 'roles_permissions' })
export class RolePermission extends BaseEntity {
    @PrimaryColumn({ name: 'role_id' })
    @Index()
    roleId!: number;

    @PrimaryColumn({ name: 'permission_id' })
    @Index()
    permissionId!: number;

    @ManyToOne((type: any) => Role, (role: { rolesPermissions: any }) => role.rolesPermissions, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role!: Role;

    @ManyToOne((type: any) => Permission, (permission: { rolesPermissions: any }) => permission.rolesPermissions, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'permission_id', referencedColumnName: 'id' })
    permission!: Permission;
}
