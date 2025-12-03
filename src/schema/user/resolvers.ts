import User from './model';
import { GlobalError } from '../root/enum';
import { isEmpty } from 'lodash';
import { hash } from 'bcrypt';
import { isValidPassword } from '../../shared/lib/util';
import Context from '../context';
import connection from '../../ormconfig';

// Helper to get a fresh User model instance using the shared connection and current GraphQL context
const getUserModel = (context: Context) => new User(connection, context);

export default {
    Query: {
        user(parent: any, {uuid}:any, context:Context) {
            const userModel = getUserModel(context);
            return userModel.show(uuid);
        },
        users(parent: any, { paging, params }:any, context:Context) {
            const userModel = getUserModel(context);
            return userModel.index(paging, params);
        },
    },
    Mutation: {
        createUser (parent: any, { input }: any, context: Context) {
            const userModel = getUserModel(context);
            return userModel.save(input);
        },
        updateUser (parent: any, { input }: any, context: Context) {
            const userModel = getUserModel(context);
            return userModel.save(input);
        },
        updateUserStatus(parent: any, { input }: any, context: Context) {
            const userModel = getUserModel(context);
            return userModel.updateStatus(input);
        },
    },
    User: {
        fullName: (parent: any) => {
            const parts = [parent.firstName, parent.middleName, parent.lastName].filter(Boolean);
            return parts.join(' ');
        },
    },
};
