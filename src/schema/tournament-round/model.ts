import BaseModel from '../baseModel';
import { TournamentRound as TournamentRoundEntity } from '../../database/entity/TournamentRound';
import Context from '../context';

export default class TournamentRound extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentRoundEntity), context);
    }
}

