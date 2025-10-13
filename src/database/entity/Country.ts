import {Entity, Column, BaseEntity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm';
import {State} from "./State";
import {City} from "./City";
import {Currency} from "./root/currency";

@Entity({ name: 'countries' })
export class Country extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 2 })
    iso2: string;

    @Column({ type: 'varchar', length: 3 })
    iso3: string;

    @Column({ name: 'numeric_code', type: 'varchar', length: 3 })
    numericCode: string;

    @Column({ name: 'phone_code', type: 'varchar', length: 5 })
    phoneCode: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    capital?: string;

    @Column((type) => Currency)
    currency?: Currency;

    @Column({ type: 'varchar', length: 255, nullable: true })
    tld?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    region?: string;

    @Column({ name: 'region_id', type: 'int', nullable: true })
    regionId?: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    subregion?: string;

    @Column({ name: 'subregion_id', type: 'int', nullable: true })
    subregionId?: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    nationality?: string;

    @Column({ type: 'text', nullable: true })
    timezones?: string;

    @Column({ type: 'text', nullable: true })
    translations?: string;

    @Column({ type: 'numeric', precision: 10, scale: 8, nullable: true })
    latitude?: number;

    @Column({ type: 'numeric', precision: 11, scale: 8, nullable: true })
    longitude?: number;

    @Column({ name: 'tax_name', type: 'varchar', length: 35, nullable: true })
    taxName: string;

    @Column({ name: 'tax_rate', type: 'decimal', default: 0, nullable: true })
    taxRate: number;

    @Column({ type: 'boolean', default: false, nullable: true })
    supported?: boolean;

    /**
     * Relations
     */

    @OneToMany((type) => State, (state) => state.country)
    states?: State[];

    @OneToMany((type) => City, (city) => city.country)
    cities?: City[];
}
