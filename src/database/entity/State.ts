import {Entity, Column, PrimaryColumn, BaseEntity, ManyToOne, JoinColumn, PrimaryGeneratedColumn} from 'typeorm';
import {Country} from "./Country";

@Entity({ name: 'states' })
export class State extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ name: 'country_code', type: 'varchar', length: 2 })
    countryCode!: string;

    @Column({ name: 'fips_code', type: 'varchar', length: 255, nullable: true })
    fipsCode?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    iso2?: string;

    @Column({ type: 'varchar', length: 191 })
    type!: string;

    @Column({ type: 'int', nullable: true })
    level?: number;

    @Column({ name: 'parent_id', type: 'int', nullable: true })
    parentId?: number;

    @Column({ type: 'numeric', precision: 10, scale: 8, nullable: true })
    latitude?: number;

    @Column({ type: 'numeric', precision: 11, scale: 8, nullable: true })
    longitude?: number;

    @Column({ type: 'int' })
    flag!: number;

    @Column({ name: 'country_id' })
    countryId: number;

    /**
     * Relations
     */
    @ManyToOne((type: any) => Country, (country) => country.states, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'country_id', referencedColumnName: 'id' })
    country!: Country;
}
