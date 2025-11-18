import BaseModel from '../baseModel';
import { TournamentMatchPlayer as TournamentMatchPlayerEntity } from '../../database/entity/TournamentMatchPlayer';
import Context from '../context';

export default class TournamentMatchPlayer extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentMatchPlayerEntity), context);
    }
}

