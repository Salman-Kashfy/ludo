import {NextFunction, Request, Response} from 'express'
import connection from "../ormconfig";
import schema from "../shared/directives/loadSchema";
import Context from '../schema/context';
import { Status } from '../database/entity/root/enums';
import { TableSessionStatus } from '../database/entity/TableSession';

export const tableStats = async (req:Request, res:Response) => {
    try {

        const ctx = Context.getInstance(connection,schema,req,req.user)
        
        // Get total count of ACTIVE tables
        const totalActiveTables = await ctx.table.repository.count({ 
            where: { status: Status.ACTIVE } 
        });

        // Get count of distinct tables that have active/booked sessions
        const occupiedTablesCount = await ctx.tableSession.repository
            .createQueryBuilder('ts')
            .select('COUNT(DISTINCT ts.tableId)', 'count')
            .where('ts.status IN (:...statuses)', { 
                statuses: [TableSessionStatus.BOOKED, TableSessionStatus.ACTIVE] 
            })
            .getRawOne();

        const occupiedTables = parseInt(occupiedTablesCount?.count || '0', 10);
        
        // Available tables = total ACTIVE tables - occupied tables
        const availableTables = totalActiveTables - occupiedTables;

        const [activeTournaments, todaysRevenue] = [0, 0];

        const data = {
            availableTables,
            occupiedTables,
            activeTournaments,
            todaysRevenue,
        }

        return res.status(200).json({ status: true, data, message: 'Retrieved successfully!' });
    } catch (error) {
        console.error('Error fetching table stats:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
