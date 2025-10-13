import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity({name: 'billing_cycles'})
export class BillingCycle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 50, unique: true})
    name: string; // e.g. "Monthly", "Quarterly", "Yearly"

    @Column({type: 'int'})
    durationInMonths: number;

    @Column({type: 'decimal', precision: 5, scale: 2, default: 1.0})
    multiplier: number; // e.g. 1.0, 2.5, 10.0

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}