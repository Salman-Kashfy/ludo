import 'reflect-metadata';
import connection from './connection';

const createSchemas = async () => {
    try {
        await connection.initialize();
        await connection.dropDatabase();
        await connection.runMigrations();
    } catch (error: any) {
        console.log('createSchemas: CreateConnection:Error: ', error.message);
    }
};

createSchemas();
