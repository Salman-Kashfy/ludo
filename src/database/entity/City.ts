import {Entity, Column, PrimaryColumn, BaseEntity, ManyToOne, JoinColumn, PrimaryGeneratedColumn} from 'typeorm';
import {Country} from "./Country";

@Entity({ name: 'cities' })
export class City extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('uuid', { unique: true, default: () => 'uuid_generate_v4()' })
    uuid!: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ name: 'country_id' })
    countryId: number;

    @Column({ name: 'state_id' })
    stateId: number;

    @Column({ name: 'state_code', type: 'varchar', length: 5, nullable: true })
    stateCode?: string;

    @Column({ name: 'country_code', type: 'varchar', length: 2 })
    countryCode: string;

    @Column({ type: 'numeric', precision: 10, scale: 8 })
    latitude: number;

    @Column({ type: 'numeric', precision: 11, scale: 8 })
    longitude: number;

    /**
     * Relations
     */
    @ManyToOne((type: any) => Country, (country) => country.cities, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'country_id', referencedColumnName: 'id' })
    country!: Country;
}
