import mysql from 'mysql2/promise';

// Configuration de la connexion MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ensa_timetable',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// Test de connexion au démarrage (non-bloquant)
pool.getConnection()
  .then((connection) => {
    console.log('✅ Connected to MySQL database');
    connection.release();
  })
  .catch((error) => {
    console.error('⚠️  Database connection error:', error.message);
    console.error('   The server will start but database operations will fail.');
    console.error('   Make sure MySQL is running and the database exists.');
  });

export default pool;

// Helper pour exécuter des requêtes
export const query = async <T = any>(
  sql: string,
  params?: any[]
): Promise<T> => {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper pour les transactions
export const transaction = async <T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
