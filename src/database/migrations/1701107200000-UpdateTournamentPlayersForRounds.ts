import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateTournamentPlayersForRounds1701107200000 implements MigrationInterface {
    name = 'UpdateTournamentPlayersForRounds1701107200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasRoundsTable = await queryRunner.hasTable('tournament_rounds');
        if (hasRoundsTable) {
            await queryRunner.dropTable('tournament_rounds', true, true, true);
        }

        const table = await queryRunner.getTable('tournament_players');
        if (!table) {
            return;
        }

        if (!table.findColumnByName('current_round')) {
            await queryRunner.addColumn(
                'tournament_players',
                new TableColumn({
                    name: 'current_round',
                    type: 'int',
                    isNullable: false,
                    default: 0,
                }),
            );
        }

        if (!table.findColumnByName('is_winner')) {
            await queryRunner.addColumn(
                'tournament_players',
                new TableColumn({
                    name: 'is_winner',
                    type: 'boolean',
                    isNullable: false,
                    default: false,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('tournament_players');
        if (table?.findColumnByName('is_winner')) {
            await queryRunner.dropColumn('tournament_players', 'is_winner');
        }
        if (table?.findColumnByName('current_round')) {
            await queryRunner.dropColumn('tournament_players', 'current_round');
        }
    }
}

