// Models
import BaseModel from '../baseModel';

// Orm entities
import {Country as CountryEntity} from '../../database/entity/Country';
import {createLoaders} from './loaders';

export default class Country extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: any) {
        super(connection, connection.getRepository(CountryEntity), context);
        this.loaders = createLoaders(this);
    }

    async getAll(input:any){
        let query = this.repository.createQueryBuilder();
        if(input.supported !== undefined){
            query.where('supported = :supported', {supported:input.supported})
        }
        query = this.sort(query, [{ field: 'name', order: 'ASC' }]);
        return { list: await query.getMany() };
    }

}

