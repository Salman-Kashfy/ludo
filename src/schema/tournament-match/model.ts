import BaseModel from '../baseModel';
import { TournamentMatch as TournamentMatchEntity } from '../../database/entity/TournamentMatch';
import Context from '../context';

export default class TournamentMatch extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentMatchEntity), context);
    }
}

