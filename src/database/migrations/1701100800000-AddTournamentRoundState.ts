import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTournamentRoundState1701100800000 implements MigrationInterface {
    name = 'AddTournamentRoundState1701100800000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('tournaments', [
            new TableColumn({
                name: 'current_round',
                type: 'int',
                isNullable: false,
                default: 0,
            }),
            new TableColumn({
                name: 'started_at',
                type: 'timestamptz',
                isNullable: true,
            }),
            new TableColumn({
                name: 'completed_at',
                type: 'timestamptz',
                isNullable: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tournaments', 'completed_at');
        await queryRunner.dropColumn('tournaments', 'started_at');
        await queryRunner.dropColumn('tournaments', 'current_round');
    }
}

