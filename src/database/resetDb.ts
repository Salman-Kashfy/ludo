import 'reflect-metadata';
import connection from './connection';

const resetDb = async () => {
  try {
    await connection.initialize();
    await connection.destroy();
  } catch (error: any) {
    console.log('ResetDb: CreateConnection:Error: ', error.message);
  }
};

resetDb();
