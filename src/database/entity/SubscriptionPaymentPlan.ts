import {Entity, PrimaryColumn, Column, BaseEntity, Index, ManyToOne, JoinColumn} from 'typeorm';
import { Status } from "./root/enums";
import {Length} from 'class-validator';
import {SubscriptionPlan} from "./SubscriptionPlan";
import {Country} from "./Country";

@Entity({ name: 'subscription_payment_plans' })
export class SubscriptionPaymentPlan extends BaseEntity {
    @PrimaryColumn()
    id!: number;

    @Column({ name: 'name' })
    @Length(1, 15)
    name: string;

    @Column('uuid', { name: 'subscription_plan_id' })
    @Index()
    subscriptionPlanId!: string;

    @Column('uuid',{ name: 'country_id', nullable: true })
    countryId!: string | null;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    price_per_employee: number | null;

    @Column({name: 'currency_symbol', nullable: true})
    currencySymbol?: string;

    @Column({ default: Status.ACTIVE })
    status: Status;

    @Column({ nullable: true })
    @Length(1, 80)
    description: string;

    @ManyToOne(() => SubscriptionPlan, (subscriptionPlan:SubscriptionPlan) => subscriptionPlan.subscriptionPaymentPlans, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'subscription_plan_id' })
    subscriptionPlan!: SubscriptionPlan;

    @ManyToOne(() => Country, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'country_id', referencedColumnName: 'id' })
    country!: Country;
}