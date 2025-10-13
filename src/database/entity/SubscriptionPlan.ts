import {Entity, PrimaryColumn, Column, BaseEntity, Index, OneToMany} from 'typeorm';
import {Status} from "./root/enums";
import {SubscriptionPlans} from "../../schema/subscription-plan/enum";
import {Length} from 'class-validator';
import {SubscriptionPaymentPlan} from "./SubscriptionPaymentPlan";

@Entity({name: 'subscription_plans'})
export class SubscriptionPlan extends BaseEntity {
    @PrimaryColumn()
    id!: number;

    @Column({name: 'name'})
    @Length(1, 15)
    name: string;

    @Column({name: 'type'})
    type: SubscriptionPlans;

    @Column('text')
    description: string;

    @Column({default: Status.ACTIVE})
    status: Status;

    @OneToMany(() => SubscriptionPaymentPlan, (subscriptionPaymentPlans:SubscriptionPaymentPlan) => subscriptionPaymentPlans.subscriptionPlan)
    subscriptionPaymentPlans:SubscriptionPaymentPlan[]
}