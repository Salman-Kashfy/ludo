import BaseModel from '../baseModel';
import { Tournament as TournamentEntity } from '../../database/entity/Tournament';
import { Status } from '../../database/entity/root/enums';
import { TournamentInput, TournamentFilter } from './types';
import Context from '../context';
import { GlobalError } from '../root/enum';
import { isEmpty } from 'lodash';
import { accessRulesByRoleHierarchy, accessRulesByRoleHierarchyUuid } from '../../shared/lib/DataRoleUtils';
import { PagingInterface } from '../../interfaces';

export default class Tournament extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentEntity), context);
    }

    async index(paging: PagingInterface, params: TournamentFilter) {

        if (!(await accessRulesByRoleHierarchyUuid(this.context, {companyUuid: params.companyUuid}))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }
        
        // Get company ID from company UUID
        const company = await this.context.company.repository.findOne({ where: { uuid: params.companyUuid } });
        if (!company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found');
        }
        
        const query = this.repository
            .createQueryBuilder('tournament')
            .leftJoinAndSelect('tournament.category', 'category')
            .andWhere('tournament.companyId = :companyId', { companyId: company.id });

        // By default only active tournaments
        if (params.status) {
            query.andWhere('tournament.status = :status', { status: params.status });
        }

        if (!isEmpty(params.searchText)) {
            query.andWhere('tournament.name ILIKE :searchText', { searchText: `%${params.searchText}%` });
        }

        if (params.dateFrom && params.dateTo) {
            query.andWhere('tournament.date BETWEEN :from AND :to', {
                from: params.dateFrom,
                to: params.dateTo,
            });
        } else if (params.dateFrom) {
            query.andWhere('tournament.date >= :from', { from: params.dateFrom });
        } else if (params.dateTo) {
            query.andWhere('tournament.date <= :to', { to: params.dateTo });
        }

        query.orderBy('tournament.date', 'DESC').addOrderBy('tournament.startTime', 'ASC');

        return this.paginator(query, paging);
    }

    async show(uuid: string) {
        try {
            const data = await this.repository.findOne({
                where: { uuid },
                relations: ['company', 'category'],
            });

            if (!data || data.status === Status.INACTIVE) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
            }

            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: data.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            return this.successResponse(data);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async saveValidate(input: TournamentInput) {
        const errors: GlobalError[] = [];
        let errorMessage: string | null = null;
        const data: any = {};

        if (!(await accessRulesByRoleHierarchyUuid(this.context, { companyUuid: input.companyUuid }))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        data.company = await this.context.company.repository.findOne({ where: { uuid: input.companyUuid } });
        if (!data.company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found');
        }

        data.category = await this.context.category.repository.findOne({ where: { uuid: input.categoryUuid } });
        if (!data.category) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Category not found');
        }

        if (isEmpty(input.name)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Tournament name is required';
        }

        if (isEmpty(input.date)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Tournament date is required';
        }

        if (isEmpty(input.startTime)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Start time is required';
        }

        if (!input.playerLimit || input.playerLimit < 2) {
            errors.push(GlobalError.INVALID_INPUT);
            errorMessage = 'Player limit must be at least 2';
        }

        if (input.uuid) {
            const existing = await this.repository.findOne({ 
                where: { uuid: input.uuid },
                relations: ['company'],
            });
            if (!existing) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
            }

            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: existing.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            data.existing = existing;
        }

        if (errors.length > 0) {
            return { data: null, errors, errorMessage };
        }

        return { data, errors, errorMessage };
    }

    async save(input: TournamentInput) {
        const validationResult = await this.saveValidate(input);
        if ('status' in validationResult && validationResult.status === false) {
            return validationResult;
        }

        const { data, errors, errorMessage } = validationResult;
        if (!isEmpty(errors)) {
            return this.formatErrors(errors, errorMessage);
        }

        try {
            const { existing, company, category } = data;
            let tournament: TournamentEntity = existing || new TournamentEntity();

            tournament.name = input.name;
            tournament.date = input.date;
            tournament.startTime = input.startTime;
            tournament.entryFee = input.entryFee ?? 0;
            tournament.prizePool = input.prizePool ?? 0;
            tournament.currencyName = input.currencyName ?? 'PKR';
            tournament.groupSize = input.groupSize;
            tournament.playerLimit = input.playerLimit;
            tournament.totalRounds = Math.ceil(Math.log(tournament.playerLimit) / Math.log(tournament.groupSize));
            tournament.status = input.status;
            tournament.companyId = company.id;
            tournament.categoryId = category.id;
            tournament.createdById = tournament.createdById || this.context.user.id;
            tournament.lastUpdatedById = this.context.user.id;

            const saved = await this.repository.save(tournament);
            return this.successResponse(saved);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async delete(uuid: string) {
        try {
            const tournament = await this.repository.findOne({ 
                where: { uuid },
                relations: ['company'],
            });
            if (!tournament) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
            }

            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            tournament.status = Status.INACTIVE;
            tournament.lastUpdatedById = this.context.user.id;
            await this.repository.save(tournament);

            return this.successResponse(true);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }
}

