import { forEach, snakeCase, map, find, isArray } from 'lodash';
import { In } from 'typeorm';
import DataLoader from 'dataloader';
import { gymAdmin, superAdmin } from '../shared/config';

export default class BaseModel {
    repository: any;
    connection: any;
    context: any;
    _idLoader: any;
    constructor(connection: any, repository: any, context: any) {
        this.connection = connection;
        this.repository = repository;
        this.context = context;
        this._idLoader = new DataLoader(async (ids: any) => {
            const items = await this.repository.find({
                where: { id: In(ids) },
            });
            return map(ids, (id) => find(items, { id }));
        });
    }

    getById(id: string) {
        if (!id) return null;
        return isArray(id) ? this._idLoader.loadMany(id) : this._idLoader.load(id);
    }

    getOneByField(field: any, value: any) {
        if (!field || !value) {
            return null;
        }
        const where: { [index: string]: any } = {};
        where[field] = value;
        return this.repository.findOne({ where });
    }

    rawPaginator(paging: any): string {
        paging.page--;
        let offset;
        if (paging.limit < 0) {
            paging.limit = 10;
        }
        if (paging.page <= 0) {
            offset = 0;
        } else {
            offset = paging.page * paging.limit;
        }
        paging.page++;
        return `limit ${paging.limit} offset ${offset}`;
    }

    async paginator(query: any, paging: any) {
        const queryBuilder = query;
        let list = [];
        if (paging) {
            paging.page--;
            if (paging.page < 0) {
                paging.page = 0;
            }
            if (paging.limit < 0) {
                paging.limit *= -1;
            }
            if (paging.page < 0) {
                paging.page;
            }
            
            // If limit is 0, treat it as "return all records"
            if (paging.limit === 0) {
                paging.limit = null;
            }
            
            const cnt = await query.getCount();
            paging.totalPages = paging.limit ? Math.ceil(cnt / paging.limit) : 1;
            paging.totalResultCount = cnt;
            
            if (paging.limit) {
                list = await queryBuilder
                    .skip(paging.page * paging.limit)
                    .take(paging.limit)
                    .getMany();
            } else {
                list = await queryBuilder.getMany();
            }
        } else {
            const dataLength = await query.getCount();
            paging = {
                totalResultCount: dataLength,
                totalPages: 1,
                page: 1,
                limit: dataLength,
            };
            list = await queryBuilder.getMany();
        }

        return { list, paging };
    }

    getAllByField(field: string, value: any) {
        if (!field || !value) {
            return null;
        }
        const where: { [index: string]: any } = {};
        where[field] = value;
        return this.repository.find({ where });
    }

    applyAuthFilter(query: any, entityName: any) {
        const { roles = [], brands = [], gyms = [] } = this.context.auth;
        if (roles.indexOf(superAdmin) === -1) {
            if (roles.indexOf(gymAdmin) !== -1) {
                if (Array.isArray(gyms) && gyms.length > 0) {
                    query.andWhere(
                        `${entityName}.gym_id IN (` +
                        gyms
                            .join(',')
                            .split(',')
                            .map(function (word: string) {
                                return "'" + word.trim() + "'";
                            })
                            .join(',') +
                        ')'
                    );
                } else {
                    query.andWhere('false');
                }
            } else {
                query.andWhere('false');
            }
        }
        return query;
    }

    sort(query: any, sort: any) {
        forEach(sort, (s) => {
            let alias = s.alias ? s.alias : '';
            let fieldName = snakeCase(s.field);
            if (alias) {
                fieldName = alias + '.' + fieldName;
            }
            query.orderBy(fieldName, s.order);
        });
        return query;
    }

    validationErrorResponse(errors:any) {
        const object:any = {}
        for (const error of errors) {
            object[error.property] = Object.values(error.constraints)[0]
        }
        return { status:false, errors:object }
    }

    formatErrors(errors: any, errorMessage?: any) {
        return { error: errors[0], errors, errorMessage, status: false, data: null };
    }

    successResponse(data:any){
        return { status:true, data }
    }

    errorResponse(message:string){
        return { status:false, message }
    }

}