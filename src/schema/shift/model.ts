import BaseModel from '../baseModel';
import { Shift as ShiftEntity } from '../../database/entity/Shift';
import { ShiftInput } from "./types";
import { GlobalError } from "../root/enum";
import { Status } from "../../database/entity/root/enums";
import { isEmpty } from "lodash";

export default class Shift extends BaseModel {
    repository: any;

    constructor(connection: any, context: any) {
        super(connection, connection.getRepository(ShiftEntity), context);
    }

    async saveValidate(input: ShiftInput) {
        let errors: any = [], errorMessage = null, data: any = {}
        
        // Validate time format and logic
        if (input.startTime && input.endTime) {
            const startTime = new Date(`2000-01-01T${input.startTime}`);
            const endTime = new Date(`2000-01-01T${input.endTime}`);
            
            if (startTime >= endTime) {
                return this.formatErrors(GlobalError.INVALID_INPUT, 'Start time must be before end time')
            }
        }

        // Validate days array
        const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        if (!input.days || input.days.length === 0) {
            return this.formatErrors(GlobalError.INVALID_INPUT, 'At least one day must be selected')
        }
        
        for (const day of input.days) {
            if (!validDays.includes(day.toUpperCase())) {
                return this.formatErrors(GlobalError.INVALID_INPUT, `Invalid day: ${day}. Valid days are: ${validDays.join(', ')}`)
            }
        }

        if (input.uuid) {
            data.existingEntity = await this.context.shift.repository.findOneBy({
                uuid: input.uuid
            })
            if (!data.existingEntity) {
                return this.formatErrors(GlobalError.RECORD_NOT_FOUND, 'Record not found')
            }
        } else {
            // Check for duplicate shift name
            data.existingEntity = await this.context.shift.repository.findOne({
                where: {
                    name: input.name,
                    status: 'ACTIVE'
                }
            });
            if (data.existingEntity) {
                return this.formatErrors(GlobalError.ALREADY_EXISTS, 'Shift with this name already exists')
            }
        }

        return { data, errors, errorMessage }
    }

    async save(input: ShiftInput) {
        try {
            const { data, errors, errorMessage } = await this.saveValidate(input)
            if (!isEmpty(errors)) {
                return this.formatErrors(errors, errorMessage);
            }

            const { existingEntity } = data;
            const shift: ShiftEntity = existingEntity || new ShiftEntity();
            const transaction = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                shift.name = input.name;
                shift.startTime = input.startTime;
                shift.endTime = input.endTime;
                shift.days = input.days.map(day => day.toUpperCase());
                shift.description = input.description;
                shift.status = input.status || Status.ACTIVE;
                shift.createdById = shift.createdById || this.context.userId;
                shift.lastUpdatedById = this.context.userId;
                await transactionalEntityManager.save(shift);
            });

            if (transaction && transaction.error && transaction.error.length > 0) {
                console.log(transaction.error);
                return this.formatErrors(GlobalError.INTERNAL_SERVER_ERROR, transaction.error)
            }
            return this.successResponse(shift);
        } catch (e: any) {
            console.log(e);
            return { errors: [GlobalError.INTERNAL_SERVER_ERROR], message: e.message };
        }
    }

    async index(paging: any, params: any) {
        try {
            const query = this.repository.createQueryBuilder('shift')


            // Apply status filter
            if (params.status) {
                query.andWhere('shift.status = :status', { status: params.status });
            }

            // Apply search filter
            if (params.searchText) {
                query.andWhere('(shift.name ILIKE :searchText OR shift.description ILIKE :searchText)', {
                    searchText: `%${params.searchText}%`
                });
            }


            // Apply ordering
            query.orderBy('shift.createdAt', 'DESC');

            const { list, paging: pagination } = await this.paginator(query, paging);
            return this.successResponse({ list, paging: pagination });
        } catch (e: any) {
            console.log(e);
            return { errors: [GlobalError.INTERNAL_SERVER_ERROR], message: e.message };
        }
    }

    async show(uuid: string) {
        try {
            const shift = await this.repository.findOne({
                where: { uuid },
                relations: ['createdBy', 'lastUpdatedBy']
            });

            if (!shift) {
                return this.formatErrors(GlobalError.RECORD_NOT_FOUND, 'Shift not found');
            }


            return this.successResponse(shift);
        } catch (e: any) {
            console.log(e);
            return { errors: [GlobalError.INTERNAL_SERVER_ERROR], message: e.message };
        }
    }

    async delete(uuid: string) {
        try {
            const shift = await this.repository.findOne({
                where: { uuid },
                relations: []
            });

            if (!shift) {
                return this.formatErrors(GlobalError.RECORD_NOT_FOUND, 'Shift not found');
            }


            await this.repository.remove(shift);
            return this.successResponse({ message: 'Shift deleted successfully' });
        } catch (e: any) {
            console.log(e);
            return { errors: [GlobalError.INTERNAL_SERVER_ERROR], message: e.message };
        }
    }
}
