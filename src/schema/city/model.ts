import BaseModel from "../baseModel";
import {City as CityEntity} from "../../database/entity/City";

export default class City extends BaseModel {
    repository: any;
    connection: any;

    constructor(connection: any, context: any) {
        super(connection, connection.getRepository(CityEntity), context);
    }

    async getCities(countryId:string) {
        const list = await this.repository.findBy({countryId})
        return { list }
    }

}