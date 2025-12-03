import User from './model';
import { GlobalError } from '../root/enum';
import { isEmpty } from 'lodash';
import { hash } from 'bcrypt';
import { isValidPassword } from '../../shared/lib/util';
import Context from '../context';

export default {
    Query: {
        user(parent: any, {uuid}:any, context:Context) {
            return context.auth.show(uuid);
        },
        users(parent: any, { paging, params }:any, context:Context) {
            return context.auth.index(paging, params);
        },
    },
    Mutation: {
        createUser (parent: any, { input }: any, context: Context) {
            return context.auth.save(input);
        },
        updateUser (parent: any, { input }: any, context: Context) {
            return context.auth.save(input);
        },
        updateUserStatus(parent: any, { input }: any, context: Context) {
            return context.auth.updateStatus(input);
        },
    },
    User: {
        fullName: (parent: any) => {
            const parts = [parent.firstName, parent.middleName, parent.lastName].filter(Boolean);
            return parts.join(' ');
        },
    },
};
