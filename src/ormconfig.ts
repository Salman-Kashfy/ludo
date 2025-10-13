import { DataSource, DataSourceOptions } from 'typeorm';
import * as PostgressConnectionStringParser from 'pg-connection-string';
import { config } from 'dotenv';

config();
const databaseUrl = process.env.TYPEORM_URL;
if (!databaseUrl) {
    throw "Please provide DB url in environment field: 'TYPEORM_URL' !";
}
const connectionOptions = PostgressConnectionStringParser.parse(databaseUrl);
const typeOrmOptions: DataSourceOptions = {
    type: 'postgres',
    name: 'default',
    host: connectionOptions.host || undefined,
    port: parseInt(connectionOptions.port || '0'),
    username: connectionOptions.user,
    password: connectionOptions.password,
    database: connectionOptions.database || '',
    schema: 'public',
    // ssl: {
    //     rejectUnauthorized: false // AWS uses a cert, so allow self-signed
    // },
    synchronize: process.env.TYPEORM_SYNCHRONIZE == 'true',
    logging: process.env.TYPEORM_LOGGING == 'false',
    entities: [require('path').join(__dirname, 'database', 'entity', '*.{ts,js}')],
    migrations: [require('path').join(__dirname, 'database', 'migrations', '*.{ts,js}')]
}

const connection = new DataSource({ ...typeOrmOptions })
export default connection;