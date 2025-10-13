import { Column } from 'typeorm';
import { IsInt } from 'class-validator';

export class Age {
    @Column({ name: '_from', nullable: true })
    from: number;

    @Column({ name: '_to', nullable: true })
    @IsInt()
    to: number;
}