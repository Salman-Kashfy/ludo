import {NextFunction, Request, Response} from 'express'
import connection from "../ormconfig";
import schema from "../shared/directives/loadSchema";
import Context from '../schema/context';
import { Status } from '../database/entity/root/enums';

export const tableStats = async (req:Request, res:Response) => {
    try {

        const ctx = Context.getInstance(connection,schema,req,req.user)
        const [activeTournaments, todaysRevenue] = [0,0]
        const [availableTables, occupiedTables] = await Promise.all([
            ctx.table.repository.count({ where: { status: Status.ACTIVE } }),
            ctx.table.repository.count({ where: { status: Status.INACTIVE } })
        ]);

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
