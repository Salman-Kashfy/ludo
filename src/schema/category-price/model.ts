import BaseModel from '../baseModel';
import { CategoryPrice as CategoryPriceEntity } from '../../database/entity/CategoryPrice';
import Context from "../context";

export default class CategoryPrice extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(CategoryPriceEntity), context);
    }
}
