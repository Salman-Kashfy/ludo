import BaseModel from '../baseModel';
import {User as UserEntity} from '../../database/entity/User';
import {OtpError} from "../otp/enum";
import {hash} from "bcrypt";
import {InviteParams, UserFilter} from "./interfaces";
import {MoreThanOrEqual, Like, Brackets, Not} from "typeorm";
import {isValidPassword} from "../../shared/lib/util";
import {GlobalError} from "../root/enum";
import {isEmpty} from "lodash";
import {PagingInterface} from "../../interfaces";
import { addQueryBuilderFilters, accessRulesByRoleHierarchy } from "../../shared/lib/DataRoleUtils";

export default class User extends BaseModel {
    repository: any;
    connection: any;
    context: any;

    constructor(connection: any, context: any) {
        super(connection, connection.getRepository(UserEntity), context);
    }

    async show(uuid: string) {
        let _query = this.repository.createQueryBuilder('user')
        const { query }:any = await addQueryBuilderFilters(this.context, _query, {}, 'companyId');
        if (query) {
            query.andWhere('user.uuid = :uuid', { uuid });
        }
        const data = await query.getOne();
        if (!data) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'User not found')
        }
        return this.successResponse(data);
    }

    async index(paging: PagingInterface, params: UserFilter) {
        let _query = this.repository.createQueryBuilder('u.')
        let { query }:any = addQueryBuilderFilters(this.context, _query, {}, 'companyId');
        query = this.resolveParamsToFilters(query, params);
        return this.paginator(query, paging);
    }

    resolveParamsToFilters(query: any, params: UserFilter) {
        if (params.searchText) {
            const originalSearchText = params.searchText;
            params.searchText = `%${params.searchText.replace(/\+/g,'').trim()}%`;
            query.andWhere(
                new Brackets((qb:any) => {
                    qb.where(`(u.first_name ILIKE '${params.searchText}')`)
                        .orWhere(`(u.last_name ILIKE '${params.searchText}')`)
                        .orWhere(`(u.first_name || ' ' || u.last_name ILIKE '${params.searchText}')`)
                        .orWhere(`(u.last_name || ' ' || u.first_name ILIKE '${params.searchText}')`)
                        .orWhere(`(u.first_name || ' ' || u.middle_name || ' ' || u.last_name ILIKE '${params.searchText}')`)
                        .orWhere(`(u.email ILIKE '${params.searchText}')`)
                        .orWhere(`(u.phone_code || '' || u.phone_number ILIKE '${params.searchText}')`)
                })
            );

            params.searchText = originalSearchText
        }
        if (params.companyId) {
            query.andWhere('user.companyId = :companyId', { companyId: params.companyId });
        }
        query.setParameters(params);
        return query;
    }
   
    /**
     * Save/Update user with validation
     */
    async saveValidate(input: any) {
        const data: any = {};
        const errors: any = [];
        let errorMessage = '';

        if(!(await accessRulesByRoleHierarchy(this.context, { companyId: input.companyId }))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        /**
         * Validate password for new users
        **/
        if (!input.uuid && input.password && !isValidPassword(input.password)) {
            return this.formatErrors([GlobalError.WEAK_PASSWORD], 'Password must have at least one uppercase letter, one lowercase letter, one number, and one special character');
        }

        /**
         * Validate unique email
        **/
        if(input.uuid){
            const user = await this.show(input.uuid)
            if(user?.data){
                data.existingEntity = user.data
                const email = await this.repository.findOneBy({ email: input.email.toLowerCase(), id: Not(user.data.id) })
                if(email){
                    return this.formatErrors([GlobalError.ALREADY_EXISTS], 'Email already registered.')
                }
            }else{
                return this.formatErrors([GlobalError.EXCEPTION], 'User not found')
            }
        }else{
            const email = await this.repository.findOneBy({ email: input.email.toLowerCase() })
            if(email){
                return this.formatErrors([GlobalError.ALREADY_EXISTS], 'Email already registered.')
            }
        }

        return { data, errors, errorMessage };
    }

    /**
     * Create new user
     */
    async save(input: any) {
        try {
            const { data, errors, errorMessage } = await this.saveValidate(input);
            if (!isEmpty(errors)) {
                return this.formatErrors(errors, errorMessage);
            }

            const user = data.existingEntity || new UserEntity();
            const transaction = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                user.roleId = input.roleId;
                user.firstName = input.firstName;
                user.middleName = input.middleName;
                user.lastName = input.lastName;
                user.email = input.email;
                user.password = input.password ? await hash(input.password, 10) : user.password;
                user.countryId = input.countryId;
                user.companyId = input.companyId;
                user.phoneCode = input.phoneCode;
                user.phoneNumber = input.phoneNumber;
                user.gender = input.gender;
                user.photo = input.photo;
                user.biometricUserId = input.biometricUserId;
                user.createdById = user.createdById || this.context.auth.id;
                user.lastUpdatedById = this.context.auth.id;

                await transactionalEntityManager.save(user);
            });

            if (transaction && transaction.error && transaction.error.length > 0) {
                console.log(transaction.error);
                return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], transaction.error);
            }
            return this.successResponse(user);
        } catch (e: any) {
            console.log(e);
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], e.message);
        }
    }

    async updateStatus(input: any) {
        const user = await this.show(input.uuid);
        if(user?.data){
            user.data.status = input.status;
            await this.repository.save(user.data);
            return this.successResponse(user.data);
        }else{
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'User not found');
        }
    }

    /**
     * Admin's invite to reset password
     * */
    async invite(input:InviteParams){
        const { inviteLink, password } = input
        const user = await this.validateInvite(inviteLink)
        if(!user){
            return this.formatErrors([OtpError.NOT_FOUND],'Invitation not found or expired. Please consider to reset your password.')
        }
        if(!isValidPassword(password)){
            return this.formatErrors([OtpError.WEAK_PASSWORD],'Password must have at least one uppercase letter, one lowercase letter, one number, and one special character')
        }
        user.password = await hash(password, 10)
        user.inviteLink = null
        user.inviteExpiry = null
        await user.save()
        return this.successResponse({})
    }

    async validateInvite(inviteLink:string){
        return this.repository.findOneBy({ inviteLink, inviteExpiry: MoreThanOrEqual(new Date())})
    }

}
