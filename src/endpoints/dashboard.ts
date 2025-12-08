import { NextFunction, Request, Response } from 'express'
import connection from "../ormconfig";
import schema from "../shared/directives/loadSchema";
import Context from '../schema/context';
import { Status } from '../database/entity/root/enums';
import { TableSessionStatus } from '../database/entity/TableSession';
import { TournamentStatus } from '../schema/tournament/types';
import { Not } from 'typeorm';
import { TableStatus } from '../schema/table/types';

export const tableStats = async (req: Request, res: Response) => {
    try {
        const ctx = Context.getInstance(connection, schema, req, req.user);

        const totalActiveTables = await ctx.table.repository.count({
            where: { status: Not(TableStatus.INACTIVE) }
        });

        const occupiedTablesCount = await ctx.tableSession.repository
            .createQueryBuilder('ts')
            .select('COUNT(DISTINCT ts.tableId)', 'count')
            .where('ts.status IN (:...statuses)', {
                statuses: [TableSessionStatus.BOOKED, TableSessionStatus.ACTIVE]
            })
            .getRawOne();

        const occupiedTables = parseInt(occupiedTablesCount?.count || '0', 10);

        const activeTournaments = await ctx.tournament.repository.count({
            where: { status: TournamentStatus.UPCOMING }
        });

        // === Today’s Revenue ===
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todaysRevenueResult = await ctx.payment.repository
            .createQueryBuilder('p')
            .select('COALESCE(SUM(p.totalAmount), 0)', 'total')
            .where('p.createdAt BETWEEN :start AND :end', { start: todayStart, end: todayEnd })
            .andWhere('p.status = :status', { status: Status.SUCCESS })
            .getRawOne();

        const todaysRevenue = parseFloat(todaysRevenueResult?.total || 0);

        const data = {
            availableTables: totalActiveTables - occupiedTables,
            occupiedTables,
            activeTournaments,
            todaysRevenue,
        };

        return res.status(200).json({ status: true, data, message: 'Retrieved successfully!' });

    } catch (error) {
        console.error('Error fetching table stats:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};