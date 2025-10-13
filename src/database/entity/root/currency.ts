import { Column } from 'typeorm';
import { IsNumber } from 'class-validator';

export class Currency {

    @Column({ name: '_name', nullable: true })
    name?: string;

    @Column({ name: '_code', nullable: true })
    code?: string;

    @Column({ name: '_symbol', nullable: true })
    symbol?: string;

    @Column({ name: '_decimal_place', nullable: true })
    @IsNumber()
    decimalPlace!: number;

    @Column({ name: '_loweset_denomination', type: 'float', nullable: true })
    @IsNumber()
    lowestDenomination!: number;
}